import { useContext, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import EventCard from "./EventCard";
import EventDetailModal from "./EventDetailModal";

export default function EventList({ events, refresh }) {
  const { token } = useContext(AuthContext);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const selectedEvent = useMemo(
    () => events.find((event) => event._id === selectedEventId) || null,
    [events, selectedEventId]
  );

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event._id} event={event} onOpen={() => setSelectedEventId(event._id)} />
        ))}
      </div>

      <EventDetailModal
        event={selectedEvent}
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEventId(null)}
        refresh={refresh}
        token={token}
      />
    </>
  );
}
