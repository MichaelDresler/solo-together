import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import EventCard from "./EventCard";
import EventDetailModal from "./EventDetailModal";

const MODAL_TRANSITION_MS = 200;

export default function EventList({ events, refresh }) {
  const { token } = useContext(AuthContext);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [activeEventId, setActiveEventId] = useState(null);
  const closeTimeoutRef = useRef(null);
  const openFrameRef = useRef(null);

  const selectedEvent = useMemo(
    () => events.find((event) => event._id === selectedEventId) || null,
    [events, selectedEventId]
  );
  const activeEvent = useMemo(
    () => events.find((event) => event._id === activeEventId) || null,
    [activeEventId, events]
  );
  const activeEventIndex = useMemo(
    () => events.findIndex((event) => event._id === activeEventId),
    [activeEventId, events]
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

    const previousEvent = events[activeEventIndex - 1];
    setActiveEventId(previousEvent._id);
    setSelectedEventId(previousEvent._id);
  }

  function handleNext() {
    if (activeEventIndex < 0 || activeEventIndex >= events.length - 1) {
      return;
    }

    const nextEvent = events[activeEventIndex + 1];
    setActiveEventId(nextEvent._id);
    setSelectedEventId(nextEvent._id);
  }

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event._id} event={event} onOpen={() => handleOpen(event._id)} />
        ))}
      </div>

      <EventDetailModal
        event={activeEvent}
        isOpen={Boolean(selectedEvent)}
        onClose={handleClose}
        refresh={refresh}
        token={token}
        onPrevious={handlePrevious}
        onNext={handleNext}
        hasPrevious={activeEventIndex > 0}
        hasNext={activeEventIndex >= 0 && activeEventIndex < events.length - 1}
      />
    </>
  );
}
