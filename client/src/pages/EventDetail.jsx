import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import GoingSoloButton from "../components/GoingSoloButton";

export default function EventDetail() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvent() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`http://localhost:5001/api/events/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load event");
          setEvent(null);
          return;
        }

        setEvent(data);
      } catch (error) {
        console.error(error);
        setError("Failed to load event");
        setEvent(null);
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [id, token]);

  if (loading) {
    return <main className="p-6 w-full">Loading event...</main>;
  }

  if (error || !event) {
    return (
      <main className="p-6 w-full">
        <p className="text-red-600">{error || "Event not found"}</p>
      </main>
    );
  }

  return (
    <main className="p-6 w-full">
      <div className="max-w-3xl space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title || "Event"}
            className="h-72 w-full rounded-lg object-cover"
          />
        ) : null}

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-gray-600">
              {event.source}
            </span>
          </div>

          <p className="text-sm text-gray-500">
            {event.startDate
              ? new Date(event.startDate).toLocaleString()
              : "Date and time unavailable"}
          </p>

          <p className="text-sm text-gray-600">
            {event.locationName || "Venue unavailable"}
            {event.city ? `, ${event.city}` : ""}
            {event.country ? `, ${event.country}` : ""}
          </p>

          <p className="text-sm leading-6 text-gray-700">
            {event.description || "No description available."}
          </p>

          {event.externalUrl && (
            <a
              href={event.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View Original Event
            </a>
          )}
        </div>

        <GoingSoloButton localEventId={event._id} />
      </div>
    </main>
  );
}
