import express from "express";
import multer from "multer";
import Event from "../models/Event.js";
import SoloAttendance from "../models/SoloAttendance.js";
import auth from "../middleware/auth.js";
import { attachSoloAttendanceSummary } from "../utils/eventAttendance.js";
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
    locationName: payload.locationName?.trim() || "",
    addressLine1: payload.addressLine1?.trim() || "",
    city: payload.city?.trim() || "",
    stateOrProvince: payload.stateOrProvince?.trim() || "",
    postalCode: payload.postalCode?.trim() || "",
    country: payload.country?.trim() || "",
    imageUrl: payload.imageUrl?.trim() || "",
    externalUrl: payload.externalUrl?.trim() || "",
    classification: payload.classification?.trim() || "",
  };
}

function isValidDate(value) {
  return value instanceof Date && Number.isFinite(value.valueOf());
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

  return Event.findOneAndUpdate(
    {
      source: "ticketmaster",
      externalSource: "ticketmaster",
      externalId,
    },
    {
      $setOnInsert: {
        source: "ticketmaster",
        externalSource: "ticketmaster",
        externalId,
        title,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
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
router.get("/", async (req, res) => {
  try {
    const events = await Event.find()
      .populate("createdBy", "username firstName lastName avatarUrl")
      .populate("userId", "username firstName lastName avatarUrl")
      .sort({ createdAt: -1 });

    const eventsWithAttendance = await attachSoloAttendanceSummary(events);

    return res.json(eventsWithAttendance);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "server error" });
  }
});

// GET single event by local Mongo id
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("createdBy", "username firstName lastName avatarUrl")
      .populate("userId", "username firstName lastName avatarUrl");

    if (!event) {
      return res.status(404).json({ error: "event not found" });
    }

    const [eventWithAttendance] = await attachSoloAttendanceSummary([event]);

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

    if (!normalizedEvent.title) {
      return res.status(400).json({ error: "title is required" });
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

    const newEvent = await Event.create({
      source: "internal",
      ...normalizedEvent,
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

    if (!normalizedEvent.title) {
      return res.status(400).json({ error: "title is required" });
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

    if (!externalId || !title) {
      return res.status(400).json({
        error: "externalId and title are required",
      });
    }

    const event = await findOrCreateTicketmasterEvent({
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
    });

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

    return res.json({ message: "event deleted successfully" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "server error" });
  }
});

export default router;
