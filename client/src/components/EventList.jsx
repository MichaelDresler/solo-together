import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AuthContext } from "../context/auth-context";
import EventCard from "./EventCard";
import EventDetailModal from "./EventDetailModal";

const MODAL_TRANSITION_MS = 200;

export default function EventList({ events, refresh }) {
  const { token } = useContext(AuthContext);
  const [eventState, setEventState] = useState(events);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [activeEventId, setActiveEventId] = useState(null);
  const closeTimeoutRef = useRef(null);
  const openFrameRef = useRef(null);

  useEffect(() => {
    setEventState(events);
  }, [events]);

  const selectedEvent = useMemo(
    () => eventState.find((event) => event._id === selectedEventId) || null,
    [eventState, selectedEventId]
  );
  const activeEvent = useMemo(
    () => eventState.find((event) => event._id === activeEventId) || null,
    [activeEventId, eventState]
  );
  const activeEventIndex = useMemo(
    () => eventState.findIndex((event) => event._id === activeEventId),
    [activeEventId, eventState]
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
    []
  );

  function handleOpen(eventId) {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    if (openFrameRef.current) {
      window.cancelAnimationFrame(openFrameRef.current);
    }

    setActiveEventId(eventId);
    openFrameRef.current = window.requestAnimationFrame(() => {
      setSelectedEventId(eventId);
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

    const previousEvent = eventState[activeEventIndex - 1];
    setActiveEventId(previousEvent._id);
    setSelectedEventId(previousEvent._id);
  }

  function handleNext() {
    if (activeEventIndex < 0 || activeEventIndex >= eventState.length - 1) {
      return;
    }

    const nextEvent = eventState[activeEventIndex + 1];
    setActiveEventId(nextEvent._id);
    setSelectedEventId(nextEvent._id);
  }

  function handleEventChange(nextEvent) {
    setEventState((currentEvents) =>
      currentEvents.map((event) =>
        event._id === nextEvent._id ? { ...event, ...nextEvent } : event
      )
    );
  }

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {eventState.map((event) => (
          <EventCard
            key={event._id}
            event={event}
            token={token}
            onOpen={() => handleOpen(event._id)}
            onEventChange={handleEventChange}
          />
        ))}
      </div>

      <EventDetailModal
        event={activeEvent}
        isOpen={Boolean(selectedEvent)}
        onClose={handleClose}
        refresh={refresh}
        token={token}
        onEventChange={handleEventChange}
        onPrevious={handlePrevious}
        onNext={handleNext}
        hasPrevious={activeEventIndex > 0}
        hasNext={activeEventIndex >= 0 && activeEventIndex < eventState.length - 1}
      />
    </>
  );
}
