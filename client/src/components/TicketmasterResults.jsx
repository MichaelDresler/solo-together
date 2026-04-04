import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
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

  function getEventKey(event) {
    return event._id || event.externalId;
  }

  const selectedEvent = useMemo(
    () => events.find((event) => getEventKey(event) === selectedEventId) || null,
    [events, selectedEventId],
  );
  const activeEvent = useMemo(
    () => events.find((event) => getEventKey(event) === activeEventId) || null,
    [activeEventId, events],
  );
  const activeEventIndex = useMemo(
    () => events.findIndex((event) => getEventKey(event) === activeEventId),
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
    if (activeEventId && !events.some((event) => getEventKey(event) === activeEventId)) {
      setActiveEventId(null);
      setSelectedEventId(null);
    }
  }, [activeEventId, events]);

  async function importEvent(targetEvent) {
    if (targetEvent._id) {
      return targetEvent._id;
    }

    const res = await fetch(getApiUrl("/api/events/import-ticketmaster"), {
      method: "POST",
      headers: createAuthHeaders(token, {
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(buildImportPayload(targetEvent)),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to open event page");
    }

    setEvents((currentEvents) =>
      currentEvents.map((currentEvent) =>
        currentEvent.externalId === targetEvent.externalId
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
    if (!event._id && (!token || event.source !== "ticketmaster")) {
      return;
    }

    setOpeningEventId(getEventKey(event));

    try {
      const localEventId =
        event.source === "ticketmaster" ? await importEvent(event) : event._id;
      navigate(`/events/${localEventId}`);
    } catch (openError) {
      console.error(openError);
    } finally {
      setOpeningEventId("");
    }
  }

  function updateEventAttendance(eventKey, nextAttendees) {
    setEvents((currentEvents) =>
      currentEvents.map((event) =>
        getEventKey(event) === eventKey
          ? {
              ...event,
              soloPreviewUsers: nextAttendees.slice(0, 3),
              soloAttendeeCount: nextAttendees.length,
            }
          : event,
      ),
    );
  }

  function handleEventChange(nextEvent) {
    setEvents((currentEvents) =>
      currentEvents.map((currentEvent) =>
        getEventKey(currentEvent) === getEventKey(nextEvent)
          || (
            currentEvent.externalId &&
            nextEvent.externalId &&
            currentEvent.externalId === nextEvent.externalId
          )
          ? { ...currentEvent, ...nextEvent }
          : currentEvent
      ),
    );
  }

  function handleOpen(eventKey) {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    if (openFrameRef.current) {
      window.cancelAnimationFrame(openFrameRef.current);
    }

    setActiveEventId(eventKey);
    openFrameRef.current = window.requestAnimationFrame(() => {
      setSelectedEventId(eventKey);
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
    const previousEventKey = getEventKey(previousEvent);
    setActiveEventId(previousEventKey);
    setSelectedEventId(previousEventKey);
  }

  function handleNext() {
    if (activeEventIndex < 0 || activeEventIndex >= events.length - 1) {
      return;
    }

    const nextEvent = events[activeEventIndex + 1];
    const nextEventKey = getEventKey(nextEvent);
    setActiveEventId(nextEventKey);
    setSelectedEventId(nextEventKey);
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
          openingEventPage={openingEventId === getEventKey(activeEvent || {})}
          onEventChange={handleEventChange}
          onAttendeesChange={
            activeEvent
              ? (nextAttendees) => updateEventAttendance(getEventKey(activeEvent), nextAttendees)
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
            key={getEventKey(event)}
            event={event}
            token={token}
            importPayload={event.source === "ticketmaster" ? buildImportPayload(event) : null}
            onEventChange={handleEventChange}
            onOpen={() => handleOpen(getEventKey(event))}
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
        openingEventPage={openingEventId === getEventKey(activeEvent || {})}
        onEventChange={handleEventChange}
        onAttendeesChange={
          activeEvent
            ? (nextAttendees) => updateEventAttendance(getEventKey(activeEvent), nextAttendees)
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
