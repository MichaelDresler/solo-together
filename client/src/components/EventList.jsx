import EventCard from "./EventCard";

export default function EventList({ events, refresh }) {
  return (
    <div>
      <h2>Events</h2>
        <div className="grid grid-cols-3 gap-4">
             {events.map((event) => (
        <EventCard
          key={event._id}
          event={event}
          refresh={refresh}
        />
      ))}

        </div>
     
    </div>
  );
}