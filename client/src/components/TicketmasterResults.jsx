import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { createAuthHeaders, getApiUrl } from "../lib/api";
import EventCard from "./EventCard";
import EventDetailModal from "./EventDetailModal";
import { buildImportPayload } from "./ticketmasterSearchUtils";

const MODAL_TRANSITION_MS = 200;

export default function TicketmasterResults({ events, setEvents, emptyState = null }) {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [activeEventId, setActiveEventId] = useState(null);
  const [openingEventId, setOpeningEventId] = useState("");
  const closeTimeoutRef = useRef(null);
  const openFrameRef = useRef(null);

  const selectedEvent = useMemo(
    () => events.find((event) => event.externalId === selectedEventId) || null,
    [events, selectedEventId],
  );
  const activeEvent = useMemo(
    () => events.find((event) => event.externalId === activeEventId) || null,
    [activeEventId, events],
  );
  const activeEventIndex = useMemo(
    () => events.findIndex((event) => event.externalId === activeEventId),
    [activeEventId, events],
  );

  useEffect(
    () => () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }

      if (openFrameRef.current) {
        window.cancelAnimationFrame(openFrameRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (activeEventId && !events.some((event) => event.externalId === activeEventId)) {
      setActiveEventId(null);
      setSelectedEventId(null);
    }
  }, [activeEventId, events]);

  async function importEvent(event) {
    if (event._id) {
      return event._id;
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
          : currentEvent,
      ),
    );

    return data._id;
  }

  async function openEventPage(event) {
    if (!token && !event._id) {
      return;
    }

    setOpeningEventId(event.externalId);

    try {
      const localEventId = await importEvent(event);
      navigate(`/events/${localEventId}`);
    } catch (openError) {
      console.error(openError);
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
          : event,
      ),
    );
  }

  function handleOpen(externalId) {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    if (openFrameRef.current) {
      window.cancelAnimationFrame(openFrameRef.current);
    }

    setActiveEventId(externalId);
    openFrameRef.current = window.requestAnimationFrame(() => {
      setSelectedEventId(externalId);
      openFrameRef.current = null;
    });
  }

  function handleClose() {
    setSelectedEventId(null);

    if (openFrameRef.current) {
      window.cancelAnimationFrame(openFrameRef.current);
      openFrameRef.current = null;
    }

    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
    }

    closeTimeoutRef.current = window.setTimeout(() => {
      setActiveEventId(null);
      closeTimeoutRef.current = null;
    }, MODAL_TRANSITION_MS);
  }

  function handlePrevious() {
    if (activeEventIndex <= 0) {
      return;
    }

    const previousEvent = events[activeEventIndex - 1];
    setActiveEventId(previousEvent.externalId);
    setSelectedEventId(previousEvent.externalId);
  }

  function handleNext() {
    if (activeEventIndex < 0 || activeEventIndex >= events.length - 1) {
      return;
    }

    const nextEvent = events[activeEventIndex + 1];
    setActiveEventId(nextEvent.externalId);
    setSelectedEventId(nextEvent.externalId);
  }

  if (!events.length) {
    return (
      <>
        {emptyState}
        <EventDetailModal
          event={activeEvent}
          isOpen={Boolean(selectedEvent)}
          onClose={handleClose}
          refresh={async () => {}}
          token={token}
          importPayload={activeEvent ? buildImportPayload(activeEvent) : null}
          onOpenEventPage={activeEvent ? () => openEventPage(activeEvent) : null}
          openingEventPage={openingEventId === activeEvent?.externalId}
          onAttendeesChange={
            activeEvent
              ? (nextAttendees) => updateEventAttendance(activeEvent.externalId, nextAttendees)
              : null
          }
          onPrevious={handlePrevious}
          onNext={handleNext}
          hasPrevious={activeEventIndex > 0}
          hasNext={activeEventIndex >= 0 && activeEventIndex < events.length - 1}
        />
      </>
    );
  }

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <EventCard
            key={event.externalId}
            event={event}
            onOpen={() => handleOpen(event.externalId)}
          />
        ))}
      </div>

      <EventDetailModal
        event={activeEvent}
        isOpen={Boolean(selectedEvent)}
        onClose={handleClose}
        refresh={async () => {}}
        token={token}
        importPayload={activeEvent ? buildImportPayload(activeEvent) : null}
        onOpenEventPage={activeEvent ? () => openEventPage(activeEvent) : null}
        openingEventPage={openingEventId === activeEvent?.externalId}
        onAttendeesChange={
          activeEvent
            ? (nextAttendees) => updateEventAttendance(activeEvent.externalId, nextAttendees)
            : null
        }
        onPrevious={handlePrevious}
        onNext={handleNext}
        hasPrevious={activeEventIndex > 0}
        hasNext={activeEventIndex >= 0 && activeEventIndex < events.length - 1}
      />
    </>
  );
}
