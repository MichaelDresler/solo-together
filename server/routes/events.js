import express from "express";
import Event from "../models/Event.js";
import SoloAttendance from "../models/SoloAttendance.js";
import auth from "../middleware/auth.js";

const router = express.Router();

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

async function attachSoloAttendanceSummary(events) {
  const eventIds = events.map((event) => event._id);

  if (eventIds.length === 0) {
    return events;
  }

  const attendances = await SoloAttendance.find({
    eventId: { $in: eventIds },
    status: "going_solo",
  })
    .populate("userId", "username firstName lastName avatarUrl")
    .sort({ createdAt: -1 });

  const attendeeMap = new Map();

  attendances.forEach((attendance) => {
    const eventId = attendance.eventId.toString();
    const currentAttendees = attendeeMap.get(eventId) || [];
    currentAttendees.push(attendance.userId);
    attendeeMap.set(eventId, currentAttendees);
  });

  return events.map((event) => {
    const eventObject = event.toObject();
    const eventAttendees = attendeeMap.get(event._id.toString()) || [];

    return {
      ...eventObject,
      soloPreviewUsers: eventAttendees.slice(0, 3),
      soloAttendeeCount: eventAttendees.length,
    };
  });
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
router.post("/", auth, async (req, res) => {
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

    const newEvent = await Event.create({
      source: "internal",
      ...normalizedEvent,
      createdBy: req.userId,
      userId: req.userId,
    });

    return res.status(201).json(newEvent);
  } catch (e) {
    console.log(e);
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
    const ownerId = event.createdBy?.toString() || event.userId?.toString();

    if (ownerId !== req.userId) {
      return res
        .status(403)
        .json({ error: "not authorized to delete this event" });
    }

    await Event.findByIdAndDelete(req.params.id);

    return res.json({ message: "event deleted successfully" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "server error" });
  }
});

export default router;
