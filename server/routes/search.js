import express from "express";
import Event from "../models/Event.js";
import Favorite from "../models/Favorite.js";
import SoloAttendance from "../models/SoloAttendance.js";
import optionalAuth from "../middleware/optionalAuth.js";
import { attachSoloAttendanceSummary } from "../utils/eventAttendance.js";

const router = express.Router();

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildSearchPattern(value) {
  return new RegExp(escapeRegExp(value.trim()), "i");
}

async function fetchInternalEvents(query, userId) {
  const searchPattern = buildSearchPattern(query);
  const events = await Event.find({
    $or: [
      { title: searchPattern },
      { description: searchPattern },
      { classification: searchPattern },
      { locationName: searchPattern },
      { addressLine1: searchPattern },
      { city: searchPattern },
      { stateOrProvince: searchPattern },
      { country: searchPattern },
    ],
  })
    .populate("createdBy", "username firstName lastName avatarUrl")
    .populate("userId", "username firstName lastName avatarUrl")
    .sort({ startDate: 1, createdAt: -1 })
    .limit(24);

  const favoriteIds = userId
    ? new Set(
        (
          await Favorite.find({
            userId,
            eventId: { $in: events.map((event) => event._id) },
          }).select("eventId")
        ).map((favorite) => favorite.eventId.toString()),
      )
    : new Set();

  const normalizedEvents = events.map((event) => ({
    ...event.toObject(),
    isFavorited: favoriteIds.has(event._id.toString()),
  }));

  return attachSoloAttendanceSummary(normalizedEvents);
}

async function attachLocalTicketmasterData(events, userId) {
  const externalIds = events.map((event) => event.id).filter(Boolean);

  if (externalIds.length === 0) {
    return events.map((event) => ({
      ...event,
      _id: null,
      isFavorited: false,
      soloPreviewUsers: [],
      soloAttendeeCount: 0,
    }));
  }

  const localEvents = await Event.find({
    externalSource: "ticketmaster",
    externalId: { $in: externalIds },
  })
    .populate("createdBy", "username firstName lastName avatarUrl")
    .populate("userId", "username firstName lastName avatarUrl");

  const localEventMap = new Map(
    localEvents.map((event) => [event.externalId, event]),
  );
  const localEventIds = localEvents.map((event) => event._id);

  const [attendances, favorites] = await Promise.all([
    SoloAttendance.find({
      eventId: { $in: localEventIds },
      status: "going_solo",
    })
      .populate("userId", "username firstName lastName avatarUrl")
      .sort({ createdAt: -1 }),
    userId
      ? Favorite.find({
          userId,
          eventId: { $in: localEventIds },
        }).select("eventId")
      : [],
  ]);

  const attendeeMap = new Map();
  const favoriteIds = new Set(
    favorites.map((favorite) => favorite.eventId.toString()),
  );

  attendances.forEach((attendance) => {
    const eventId = attendance.eventId.toString();
    const currentAttendees = attendeeMap.get(eventId) || [];
    currentAttendees.push(attendance.userId);
    attendeeMap.set(eventId, currentAttendees);
  });

  return events.map((event) => {
    const localEvent = localEventMap.get(event.id);

    if (!localEvent) {
      return {
        ...event,
        _id: null,
        isFavorited: false,
        soloPreviewUsers: [],
        soloAttendeeCount: 0,
      };
    }

    const eventAttendees = attendeeMap.get(localEvent._id.toString()) || [];

    return {
      ...event,
      _id: localEvent._id,
      createdBy: localEvent.createdBy,
      userId: localEvent.userId,
      isFavorited: favoriteIds.has(localEvent._id.toString()),
      soloPreviewUsers: eventAttendees.slice(0, 3),
      soloAttendeeCount: eventAttendees.length,
    };
  });
}

async function fetchTicketmasterEvents(query, userId) {
  const apiKey = process.env.TICKETMASTER_API_KEY;

  if (!apiKey) {
    return [];
  }

  const params = new URLSearchParams({
    apikey: apiKey,
    countryCode: "CA",
    size: "12",
    sort: "relevance,desc",
    keyword: query,
  });

  const ticketmasterRes = await fetch(
    `https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`,
  );
  const data = await ticketmasterRes.json();

  if (!ticketmasterRes.ok) {
    const apiError =
      data?.fault?.faultstring ||
      data?.errors?.[0]?.detail ||
      "Ticketmaster request failed";

    throw new Error(apiError);
  }

  const rawEvents = (data?._embedded?.events || []).map((event) => {
    const venue = event?._embedded?.venues?.[0];
    const image = event.images?.[0];
    const classification = event.classifications?.[0];

    return {
      id: event.id || "",
      title: event.name || "",
      description: event.info || event.pleaseNote || "",
      url: event.url || "",
      start:
        event.dates?.start?.dateTime ||
        event.dates?.start?.localDate ||
        "",
      end:
        event.dates?.end?.dateTime ||
        event.dates?.end?.localDate ||
        "",
      locationName: venue?.name || "",
      venue: venue?.name || "",
      addressLine1: venue?.address?.line1 || "",
      city: venue?.city?.name || "",
      stateOrProvince: venue?.state?.name || venue?.state?.stateCode || "",
      postalCode: venue?.postalCode || "",
      country: venue?.country?.name || venue?.country?.countryCode || "",
      imageUrl: image?.url || "",
      classification:
        classification?.genre?.name ||
        classification?.segment?.name ||
        "",
      source: "ticketmaster",
      externalSource: "ticketmaster",
    };
  });

  return attachLocalTicketmasterData(rawEvents, userId);
}

router.get("/events", optionalAuth, async (req, res) => {
  const query = req.query.q?.trim() || "";

  if (!query) {
    return res.json({ events: [] });
  }

  try {
    const [internalEvents, ticketmasterEvents] = await Promise.all([
      fetchInternalEvents(query, req.userId),
      fetchTicketmasterEvents(query, req.userId),
    ]);

    let events = [...internalEvents, ...ticketmasterEvents];

    if (req.query.source?.trim()) {
      events = events.filter((event) => event.source === req.query.source);
    }

    if (req.query.classification?.trim()) {
      const expectedClassification = req.query.classification.trim().toLowerCase();
      events = events.filter(
        (event) => event.classification?.trim().toLowerCase() === expectedClassification,
      );
    }

    return res.json({ events });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message || "Failed to search events" });
  }
});

export default router;
