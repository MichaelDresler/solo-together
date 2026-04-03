import { useEffect, useState } from "react";
import { getApiUrl } from "../lib/api";
import { normalizeTicketmasterEvent } from "./ticketmasterSearchUtils";

export default function useTicketmasterEventSearch(query) {
  const trimmedQuery = query.trim();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!trimmedQuery) {
      setEvents([]);
      setError("");
      setLoading(false);
      return;
    }

    let isCancelled = false;

    async function loadEvents() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({ q: trimmedQuery });
        const res = await fetch(getApiUrl(`/api/ticketmaster/events?${params.toString()}`));
        const data = await res.json();

        if (isCancelled) {
          return;
        }

        if (!res.ok) {
          setError(data.error || "Failed to load Ticketmaster events");
          setEvents([]);
          return;
        }

        setEvents((data.events || []).map(normalizeTicketmasterEvent));
      } catch (submitError) {
        if (isCancelled) {
          return;
        }

        console.error(submitError);
        setError("Failed to load Ticketmaster events");
        setEvents([]);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      isCancelled = true;
    };
  }, [trimmedQuery]);

  return {
    events,
    error,
    loading,
    hasQuery: Boolean(trimmedQuery),
    query: trimmedQuery,
    setEvents,
  };
}
