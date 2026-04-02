import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { createAuthHeaders, getApiUrl } from "../lib/api";
import EventCard from "./EventCard";
import EventDetailModal from "./EventDetailModal";

function buildImportPayload(event) {
  return {
    externalId: event.externalId,
    title: event.title,
    description: event.description || "",
    startDate: event.startDate || null,
    endDate: event.endDate || null,
    locationName: event.locationName || "",
    addressLine1: event.addressLine1 || "",
    city: event.city || "",
    stateOrProvince: event.stateOrProvince || "",
    postalCode: event.postalCode || "",
    country: event.country || "",
    classification: event.classification || "",
    imageUrl: event.imageUrl || "",
    externalUrl: event.externalUrl || "",
  };
}

function normalizeTicketmasterEvent(event) {
  return {
    _id: event._id || null,
    externalId: event.id || "",
    source: "ticketmaster",
    externalSource: "ticketmaster",
    title: event.title || "",
    description: event.description || "",
    startDate: event.start || "",
    endDate: event.end || "",
    locationName: event.locationName || event.venue || "",
    addressLine1: event.addressLine1 || "",
    city: event.city || "",
    stateOrProvince: event.stateOrProvince || "",
    postalCode: event.postalCode || "",
    country: event.country || "",
    imageUrl: event.imageUrl || "",
    externalUrl: event.url || "",
    classification: event.classification || "",
    createdBy: event.createdBy || null,
    userId: event.userId || null,
    soloPreviewUsers: event.soloPreviewUsers || [],
    soloAttendeeCount: event.soloAttendeeCount || 0,
  };
}

export default function TicketmasterSearch() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [openingEventId, setOpeningEventId] = useState("");

  const selectedEvent = useMemo(
    () => events.find((event) => event.externalId === selectedEventId) || null,
    [events, selectedEventId]
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (query.trim()) {
        params.set("q", query.trim());
      }

      const res = await fetch(getApiUrl(`/api/ticketmaster/events?${params.toString()}`));
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load Ticketmaster events");
        setEvents([]);
        return;
      }

      setEvents((data.events || []).map(normalizeTicketmasterEvent));
    } catch (submitError) {
      console.error(submitError);
      setError("Failed to load Ticketmaster events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  async function importEvent(event) {
    const existingId = event._id;

    if (existingId) {
      return existingId;
    }

    const res = await fetch(getApiUrl("/api/events/import-ticketmaster"), {
      method: "POST",
      headers: createAuthHeaders(token, {
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(buildImportPayload(event)),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to open event page");
    }

    setEvents((currentEvents) =>
      currentEvents.map((currentEvent) =>
        currentEvent.externalId === event.externalId
          ? {
              ...currentEvent,
              _id: data._id,
              createdBy: data.createdBy || currentEvent.createdBy,
              userId: data.userId || currentEvent.userId,
            }
          : currentEvent
      )
    );

    return data._id;
  }

  async function openEventPage(event) {
    if (!token && !event._id) {
      setError("Log in to open this event page.");
      return;
    }

    setOpeningEventId(event.externalId);
    setError("");

    try {
      const localEventId = await importEvent(event);
      navigate(`/events/${localEventId}`);
    } catch (openError) {
      console.error(openError);
      setError(openError.message || "Failed to open event page");
    } finally {
      setOpeningEventId("");
    }
  }

  function updateEventAttendance(externalId, nextAttendees) {
    setEvents((currentEvents) =>
      currentEvents.map((event) =>
        event.externalId === externalId
          ? {
              ...event,
              soloPreviewUsers: nextAttendees.slice(0, 3),
              soloAttendeeCount: nextAttendees.length,
            }
          : event
      )
    );
  }

  return (
    <section className="space-y-4 rounded-xl border border-gray-200 p-6 shadow-sm">
      <form className="flex gap-3" onSubmit={handleSubmit}>
        <div className="relative w-full max-w-200">
          <input
            className="w-full rounded-full bg-black/5 px-4 py-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="Search concerts, games, or shows"
            value={query}
            onChange={(inputEvent) => setQuery(inputEvent.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="absolute right-1.5 top-1/2 rounded-full bg-[#b35119] p-2.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:bg-stone-400 -translate-y-1/2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </button>
        </div>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <EventCard
            key={event.externalId}
            event={event}
            onOpen={() => setSelectedEventId(event.externalId)}
          />
        ))}
      </div>

      <EventDetailModal
        event={selectedEvent}
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEventId(null)}
        refresh={async () => {}}
        token={token}
        importPayload={selectedEvent ? buildImportPayload(selectedEvent) : null}
        onOpenEventPage={
          selectedEvent ? () => openEventPage(selectedEvent) : null
        }
        openingEventPage={openingEventId === selectedEvent?.externalId}
        onAttendeesChange={
          selectedEvent
            ? (nextAttendees) => updateEventAttendance(selectedEvent.externalId, nextAttendees)
            : null
        }
      />
    </section>
  );
}
