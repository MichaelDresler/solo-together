import { useEffect, useState } from "react";
import { createAuthHeaders, getApiUrl } from "../lib/api";
import { normalizeSearchEvent } from "./ticketmasterSearchUtils";

export default function useTicketmasterEventSearch(query, token = null) {
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
        const res = await fetch(getApiUrl(`/api/search/events?${params.toString()}`), {
          headers: createAuthHeaders(token),
        });
        const data = await res.json();

        if (isCancelled) {
          return;
        }

        if (!res.ok) {
          setError(data.error || "Failed to load search results");
          setEvents([]);
          return;
        }

        setEvents((data.events || []).map(normalizeSearchEvent));
      } catch (submitError) {
        if (isCancelled) {
          return;
        }

        console.error(submitError);
        setError("Failed to load search results");
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
  }, [token, trimmedQuery]);

  return {
    events,
    error,
    loading,
    hasQuery: Boolean(trimmedQuery),
    query: trimmedQuery,
    setEvents,
  };
}
