import express from "express";
import multer from "multer";
import Event from "../models/Event.js";
import Favorite from "../models/Favorite.js";
import SoloAttendance from "../models/SoloAttendance.js";
import auth from "../middleware/auth.js";
import optionalAuth from "../middleware/optionalAuth.js";
import { attachSoloAttendanceSummary } from "../utils/eventAttendance.js";
import { geocodeAddress } from "../utils/geocodeAddress.js";
import {
  deleteCloudinaryAsset,
  uploadEventImage,
} from "../utils/cloudinary.js";

const router = express.Router();
const MAX_EVENT_IMAGE_FILE_SIZE = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_EVENT_IMAGE_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype?.startsWith("image/")) {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "image"));
      return;
    }

    cb(null, true);
  },
});

function handleEventImageUpload(req, res, next) {
  upload.single("image")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error: "Event banner must be 5MB or smaller.",
        });
      }

      return res.status(400).json({
        error: "Please upload a valid image file for your event banner.",
      });
    }

    return res.status(400).json({
      error: error.message || "Unable to process event banner upload.",
    });
  });
}

function normalizeEventPayload(payload) {
  return {
    title: payload.title?.trim() || "",
    description: payload.description?.trim() || "",
    startDate: payload.startDate ? new Date(payload.startDate) : null,
    endDate: payload.endDate ? new Date(payload.endDate) : null,
    addressLine1: payload.addressLine1?.trim() || "",
    city: payload.city?.trim() || "",
    stateOrProvince: payload.stateOrProvince?.trim() || "",
    postalCode: payload.postalCode?.trim() || "",
    country: payload.country?.trim() || "",
    imageUrl: payload.imageUrl?.trim() || "",
    externalUrl: payload.externalUrl?.trim() || "",
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildExactMatchRegex(value) {
  return new RegExp(`^${escapeRegExp(value.trim())}$`, "i");
}

function buildEventFilters(query) {
  const filters = {};

  if (query.source?.trim()) {
    filters.source = query.source.trim();
  }

  if (query.classification?.trim()) {
    filters.classification = buildExactMatchRegex(query.classification);
  }

  if (query.city?.trim()) {
    filters.city = buildExactMatchRegex(query.city);
  }

  if (query.country?.trim()) {
    filters.country = buildExactMatchRegex(query.country);
  }

  if (query.startDateFrom) {
    const parsedDate = new Date(query.startDateFrom);

    if (Number.isFinite(parsedDate.valueOf())) {
      filters.startDate = { $gte: parsedDate };
    }
  }

  if (query.q?.trim()) {
    const searchPattern = new RegExp(escapeRegExp(query.q.trim()), "i");
    filters.$or = [
      { title: searchPattern },
      { description: searchPattern },
      { classification: searchPattern },
      { locationName: searchPattern },
      { addressLine1: searchPattern },
      { city: searchPattern },
      { stateOrProvince: searchPattern },
      { country: searchPattern },
    ];
  }

  return filters;
}

async function attachFavoriteState(events, userId) {
  if (!userId || events.length === 0) {
    return events.map((event) => ({
      ...(typeof event.toObject === "function" ? event.toObject() : event),
      isFavorited: false,
    }));
  }

  const eventIds = events
    .map((event) => event?._id)
    .filter(Boolean);

  const favorites = await Favorite.find({
    userId,
    eventId: { $in: eventIds },
  }).select("eventId");
  const favoriteIds = new Set(
    favorites.map((favorite) => favorite.eventId.toString()),
  );

  return events.map((event) => {
    const normalizedEvent =
      typeof event.toObject === "function" ? event.toObject() : event;

    return {
      ...normalizedEvent,
      isFavorited: favoriteIds.has(normalizedEvent._id?.toString()),
    };
  });
}

function normalizeTicketmasterTitle(title) {
  return title?.trim().toLowerCase() || "";
}

function parseLocationInput(payload) {
  if (!payload || payload.location == null) {
    return null;
  }

  const { location } = payload;

  if (typeof location === "string") {
    const trimmedLocation = location.trim();

    if (!trimmedLocation) {
      return null;
    }

    try {
      return JSON.parse(trimmedLocation);
    } catch (error) {
      console.log("failed to parse event location payload", error);
      return null;
    }
  }

  if (typeof location === "object") {
    return location;
  }

  return null;
}

function buildAddressFromParts(parts) {
  return parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
}

function getRequestedLocationAddress(payload, normalizedEvent) {
  const locationInput = parseLocationInput(payload);
  const nestedAddress = locationInput?.address;

  if (typeof nestedAddress === "string" && nestedAddress.trim()) {
    return nestedAddress.trim();
  }

  return buildAddressFromParts([
    normalizedEvent.addressLine1,
    normalizedEvent.city,
    normalizedEvent.stateOrProvince,
    normalizedEvent.postalCode,
    normalizedEvent.country,
  ]);
}

async function geocodeEventAddress(address) {
  if (!address?.trim()) {
    return null;
  }

  try {
    const geocodedLocation = await geocodeAddress(address.trim());

    if (
      !Number.isFinite(geocodedLocation?.lat) ||
      !Number.isFinite(geocodedLocation?.lng)
    ) {
      return null;
    }

    return {
      address: address.trim(),
      lat: geocodedLocation.lat,
      lng: geocodedLocation.lng,
    };
  } catch (error) {
    console.log("failed to geocode event address", {
      address,
      error: error.message,
    });
    throw error;
  }
}

function isValidDate(value) {
  return value instanceof Date && Number.isFinite(value.valueOf());
}

function hasValidEventLocation(location) {
  return (
    Boolean(location?.address?.trim()) &&
    Number.isFinite(location?.lat) &&
    Number.isFinite(location?.lng)
  );
}

function buildEventLocation(address, geocodedLocation) {
  if (geocodedLocation) {
    return geocodedLocation;
  }

  return {
    address: address.trim(),
  };
}

function getEventOwnerId(event) {
  return event.createdBy?.toString() || event.userId?.toString() || null;
}

function canManageEvent(user, event) {
  if (!user || !event) {
    return false;
  }

  if (["admin", "super_admin"].includes(user.role)) {
    return true;
  }

  return getEventOwnerId(event) === user._id.toString();
}

async function findOrCreateTicketmasterEvent(payload) {
  const {
    externalId,
    title,
    description = "",
    startDate = null,
    endDate = null,
    locationName = "",
    addressLine1 = "",
    city = "",
    stateOrProvince = "",
    postalCode = "",
    country = "",
    classification = "",
    imageUrl = "",
    externalUrl = "",
  } = payload;
  const normalizedTitle = normalizeTicketmasterTitle(title);

  const locationAddress = buildAddressFromParts([
    addressLine1,
    city,
    stateOrProvince,
    postalCode,
    country,
  ]);

  if (!locationAddress) {
    throw new Error("ticketmaster event address is required");
  }

  const geocodedLocation = await geocodeEventAddress(locationAddress);

  if (!geocodedLocation) {
    throw new Error("ticketmaster event could not be geocoded");
  }

  return Event.findOneAndUpdate(
    {
      source: "ticketmaster",
      externalSource: "ticketmaster",
      externalId,
    },
    {
      $set: {
        title: normalizedTitle,
      },
      $setOnInsert: {
        source: "ticketmaster",
        externalSource: "ticketmaster",
        externalId,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        location: geocodedLocation,
        locationName,
        addressLine1,
        city,
        stateOrProvince,
        postalCode,
        country,
        classification,
        imageUrl,
        externalUrl,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );
}

// GET all events
router.get("/", optionalAuth, async (req, res) => {
  try {
    const filters = buildEventFilters(req.query);
    const limit = Number.parseInt(req.query.limit, 10);
    const query = Event.find(filters)
      .populate("createdBy", "username firstName lastName avatarUrl")
      .populate("userId", "username firstName lastName avatarUrl")
      .sort({ startDate: 1, createdAt: -1 });

    if (Number.isInteger(limit) && limit > 0) {
      query.limit(Math.min(limit, 100));
    }

    const events = await query;
    const eventsWithFavorites = await attachFavoriteState(events, req.userId);
    const eventsWithAttendance = await attachSoloAttendanceSummary(eventsWithFavorites);

    return res.json(eventsWithAttendance);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "server error" });
  }
});

// GET single event by local Mongo id
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("createdBy", "username firstName lastName avatarUrl")
      .populate("userId", "username firstName lastName avatarUrl");

    if (!event) {
      return res.status(404).json({ error: "event not found" });
    }

    const [eventWithFavoriteState] = await attachFavoriteState([event], req.userId);
    const [eventWithAttendance] = await attachSoloAttendanceSummary([eventWithFavoriteState]);

    return res.json(eventWithAttendance);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "server error" });
  }
});

// POST create new event (protected)
router.post("/", auth, handleEventImageUpload, async (req, res) => {
  let uploadedEventImage = null;

  try {
    const normalizedEvent = normalizeEventPayload(req.body);
    const locationAddress = getRequestedLocationAddress(req.body, normalizedEvent);

    if (!normalizedEvent.title) {
      return res.status(400).json({ error: "title is required" });
    }

    if (!locationAddress) {
      return res.status(400).json({ error: "location.address is required" });
    }

    if (
      (normalizedEvent.startDate && !isValidDate(normalizedEvent.startDate)) ||
      (normalizedEvent.endDate && !isValidDate(normalizedEvent.endDate))
    ) {
      return res.status(400).json({
        error: "please provide valid start and end dates",
      });
    }

    if (
      normalizedEvent.startDate &&
      normalizedEvent.endDate &&
      isValidDate(normalizedEvent.startDate) &&
      isValidDate(normalizedEvent.endDate) &&
      normalizedEvent.endDate < normalizedEvent.startDate
    ) {
      return res.status(400).json({
        error: "end date must be after the start date",
      });
    }

    if (req.file) {
      uploadedEventImage = await uploadEventImage(req.file.buffer, req.userId);
      normalizedEvent.imageUrl = uploadedEventImage.imageUrl;
    }

    let geocodedLocation = null;

    try {
      geocodedLocation = await geocodeEventAddress(locationAddress);
    } catch (error) {
      console.log("continuing without event coordinates", {
        address: locationAddress,
        error: error.message,
      });
    }

    if (!geocodedLocation) {
      console.log("event geocoding returned no result", {
        address: locationAddress,
      });
    }

    const newEvent = await Event.create({
      source: "internal",
      ...normalizedEvent,
      location: buildEventLocation(locationAddress, geocodedLocation),
      imagePublicId: uploadedEventImage?.imagePublicId || "",
      createdBy: req.userId,
      userId: req.userId,
    });

    return res.status(201).json(newEvent);
  } catch (e) {
    console.log(e);

    if (uploadedEventImage?.imagePublicId) {
      try {
        await deleteCloudinaryAsset(uploadedEventImage.imagePublicId);
      } catch (deleteError) {
        console.log("failed to delete orphaned event image", deleteError);
      }
    }

    return res.status(500).json({ error: "server error" });
  }
});

router.patch("/:id", auth, handleEventImageUpload, async (req, res) => {
  let uploadedEventImage = null;

  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: "event not found" });
    }

    if (!canManageEvent(req.user, event)) {
      return res.status(403).json({ error: "not authorized to update this event" });
    }

    const normalizedEvent = normalizeEventPayload(req.body);
    const locationAddress = getRequestedLocationAddress(req.body, normalizedEvent);

    if (!normalizedEvent.title) {
      return res.status(400).json({ error: "title is required" });
    }

    if (req.body.location != null && !locationAddress) {
      return res.status(400).json({ error: "location.address is required" });
    }

    if (
      (normalizedEvent.startDate && !isValidDate(normalizedEvent.startDate)) ||
      (normalizedEvent.endDate && !isValidDate(normalizedEvent.endDate))
    ) {
      return res.status(400).json({
        error: "please provide valid start and end dates",
      });
    }

    if (
      normalizedEvent.startDate &&
      normalizedEvent.endDate &&
      isValidDate(normalizedEvent.startDate) &&
      isValidDate(normalizedEvent.endDate) &&
      normalizedEvent.endDate < normalizedEvent.startDate
    ) {
      return res.status(400).json({
        error: "end date must be after the start date",
      });
    }

    if (req.file) {
      uploadedEventImage = await uploadEventImage(req.file.buffer, req.userId);
      normalizedEvent.imageUrl = uploadedEventImage.imageUrl;
      normalizedEvent.imagePublicId = uploadedEventImage.imagePublicId;
    }

    if (req.body.location != null) {
      const currentLocationAddress =
        buildAddressFromParts([
          event.addressLine1,
          event.city,
          event.stateOrProvince,
          event.postalCode,
          event.country,
        ]) || event.location?.address || "";
      const needsLocationRepair = !hasValidEventLocation(event.location);

      if (locationAddress !== currentLocationAddress || needsLocationRepair) {
        let geocodedLocation = null;

        try {
          geocodedLocation = await geocodeEventAddress(locationAddress);
        } catch (error) {
          console.log("continuing without updated event coordinates", {
            address: locationAddress,
            error: error.message,
          });
        }

        if (!geocodedLocation) {
          console.log("event geocoding returned no result", {
            address: locationAddress,
          });
        }

        normalizedEvent.location = buildEventLocation(locationAddress, geocodedLocation);
      }
    }

    const previousImagePublicId = event.imagePublicId;

    Object.assign(event, normalizedEvent);

    if (uploadedEventImage?.imagePublicId) {
      event.imagePublicId = uploadedEventImage.imagePublicId;
    }

    await event.save();

    if (
      uploadedEventImage?.imagePublicId &&
      previousImagePublicId &&
      previousImagePublicId !== uploadedEventImage.imagePublicId
    ) {
      try {
        await deleteCloudinaryAsset(previousImagePublicId);
      } catch (deleteError) {
        console.log("failed to delete replaced event image", deleteError);
      }
    }

    const populatedEvent = await Event.findById(event._id)
      .populate("createdBy", "username firstName lastName avatarUrl")
      .populate("userId", "username firstName lastName avatarUrl");

    return res.json(populatedEvent);
  } catch (e) {
    console.log("failed to update event", {
      eventId: req.params.id,
      error: e.message,
      validationErrors: e?.errors ? Object.keys(e.errors) : [],
    });

    if (uploadedEventImage?.imagePublicId) {
      try {
        await deleteCloudinaryAsset(uploadedEventImage.imagePublicId);
      } catch (deleteError) {
        console.log("failed to delete orphaned event image", deleteError);
      }
    }

    return res.status(500).json({ error: "server error" });
  }
});

// POST import a Ticketmaster event into the local Event collection
router.post("/import-ticketmaster", auth, async (req, res) => {
  try {
    const {
      externalId,
      title,
      description,
      startDate,
      endDate,
      locationName,
      addressLine1,
      city,
      stateOrProvince,
      postalCode,
      country,
      classification,
      imageUrl,
      externalUrl,
    } = req.body;
    const normalizedTitle = normalizeTicketmasterTitle(title);

    if (!externalId || !normalizedTitle) {
      return res.status(400).json({
        error: "externalId and title are required",
      });
    }

    let event;

    try {
      event = await findOrCreateTicketmasterEvent({
        externalId,
        title: normalizedTitle,
        description,
        startDate,
        endDate,
        locationName,
        addressLine1,
        city,
        stateOrProvince,
        postalCode,
        country,
        classification,
        imageUrl,
        externalUrl,
      });
    } catch (error) {
      console.log("failed to import ticketmaster event", {
        externalId,
        error: error.message,
      });

      return res.status(400).json({
        error: "Unable to geocode the imported event location.",
      });
    }

    return res.status(200).json(event);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "server error" });
  }
});

// POST mark current user as going solo for an event
router.post("/:id/solo", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: "event not found" });
    }

    const attendance = await SoloAttendance.findOneAndUpdate(
      { userId: req.userId, eventId: event._id },
      { status: "going_solo" },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    ).populate("userId", "username firstName lastName");
    

    return res.status(201).json(attendance);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "server error" });
  }
});

// DELETE remove current user from going solo for an event
router.delete("/:id/solo", auth, async (req, res) => {
  try {
    const attendance = await SoloAttendance.findOneAndDelete({
      userId: req.userId,
      eventId: req.params.id,
    });

    if (!attendance) {
      return res.status(404).json({ error: "solo attendance not found" });
    }

    return res.json({ message: "solo attendance removed" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "server error" });
  }
});

// GET all solo attendees for an event
router.get("/:id/solo-attendees", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: "event not found" });
    }

    const attendees = await SoloAttendance.find({
      eventId: event._id,
      status: "going_solo",
    })
      .populate("userId", "username firstName lastName avatarUrl")
      .sort({ createdAt: -1 });

    return res.json(attendees);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "server error" });
  }
});

router.post("/:id/favorite", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: "event not found" });
    }

    await Favorite.findOneAndUpdate(
      { userId: req.userId, eventId: event._id },
      { userId: req.userId, eventId: event._id },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return res.status(201).json({
      eventId: event._id,
      isFavorited: true,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "server error" });
  }
});

router.delete("/:id/favorite", auth, async (req, res) => {
  try {
    await Favorite.findOneAndDelete({
      userId: req.userId,
      eventId: req.params.id,
    });

    return res.json({
      eventId: req.params.id,
      isFavorited: false,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "server error" });
  }
});

// DELETE event by id (protected)
router.delete("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: "event not found" });
    }

    // make sure users can only delete their own events
    if (!canManageEvent(req.user, event)) {
      return res
        .status(403)
        .json({ error: "not authorized to delete this event" });
    }

    if (event.imagePublicId) {
      try {
        await deleteCloudinaryAsset(event.imagePublicId);
      } catch (deleteError) {
        console.log("failed to delete event image", deleteError);
      }
    }

    await Event.findByIdAndDelete(req.params.id);
    await SoloAttendance.deleteMany({ eventId: req.params.id });
    await Favorite.deleteMany({ eventId: req.params.id });

    return res.json({ message: "event deleted successfully" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "server error" });
  }
});

export default router;
