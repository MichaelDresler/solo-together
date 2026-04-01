import EventCard from "./EventCard";

export default function EventList({ events, refresh }) {
  return (
    <div>
        <div className="grid grid-cols-2 gap-4">
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