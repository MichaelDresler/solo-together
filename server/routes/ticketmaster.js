import express from "express";
import Event from "../models/Event.js";
import SoloAttendance from "../models/SoloAttendance.js";

const router = express.Router();

async function attachLocalEventData(events) {
  const externalIds = events.map((event) => event.id).filter(Boolean);

  if (externalIds.length === 0) {
    return events;
  }

  const localEvents = await Event.find({
    externalSource: "ticketmaster",
    externalId: { $in: externalIds },
  })
    .populate("createdBy", "username firstName lastName avatarUrl")
    .populate("userId", "username firstName lastName avatarUrl");

  const localEventMap = new Map(localEvents.map((event) => [event.externalId, event]));
  const localEventIds = localEvents.map((event) => event._id);

  const attendances = await SoloAttendance.find({
    eventId: { $in: localEventIds },
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
    const localEvent = localEventMap.get(event.id);

    if (!localEvent) {
      return {
        ...event,
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
      soloPreviewUsers: eventAttendees.slice(0, 3),
      soloAttendeeCount: eventAttendees.length,
    };
  });
}

router.get("/events", async (req, res) => {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  const query = req.query.q?.trim() || "";

  if (!apiKey) {
    return res.status(500).json({ error: "Ticketmaster API key is not configured" });
  }

  try {
    const params = new URLSearchParams({
      apikey: apiKey,
      countryCode: "CA",
      size: "5",
      sort: "date,asc",
    });

    if (query) {
      params.set("keyword", query);
    }

    const ticketmasterRes = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`
    );
    const data = await ticketmasterRes.json();

    if (!ticketmasterRes.ok) {
      const apiError =
        data?.fault?.faultstring || data?.errors?.[0]?.detail || "Ticketmaster request failed";

      return res.status(ticketmasterRes.status).json({ error: apiError });
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
      };
    });

    const events = await attachLocalEventData(rawEvents);

    return res.json({ events });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to fetch Ticketmaster events" });
  }
});

export default router;
