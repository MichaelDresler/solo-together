import express from "express";

const router = express.Router();

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

    const events = (data?._embedded?.events || []).map((event) => {
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
        city: venue?.city?.name || "",
        country: venue?.country?.name || venue?.country?.countryCode || "",
        imageUrl: image?.url || "",
        classification:
          classification?.genre?.name ||
          classification?.segment?.name ||
          "",
      };
    });

    return res.json({ events });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to fetch Ticketmaster events" });
  }
});

export default router;
