import { useState } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import GoingSoloButton from "./GoingSoloButton";

export default function TicketmasterSearch() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openingEventId, setOpeningEventId] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (query.trim()) {
        params.set("q", query.trim());
      }

      const res = await fetch(
        `http://localhost:5001/api/ticketmaster/events?${params.toString()}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load Ticketmaster events");
        setEvents([]);
        return;
      }

      setEvents(data.events || []);
    } catch (error) {
      console.error(error);
      setError("Failed to load Ticketmaster events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  function buildImportPayload(event) {
    return {
      externalId: event.id,
      title: event.title,
      description: event.description || "",
      startDate: event.start || null,
      endDate: event.end || null,
      locationName: event.locationName || event.venue || "",
      addressLine1: event.addressLine1 || "",
      city: event.city || "",
      stateOrProvince: event.stateOrProvince || "",
      postalCode: event.postalCode || "",
      country: event.country || "",
      classification: event.classification || "",
      imageUrl: event.imageUrl || "",
      externalUrl: event.url || "",
    };
  }

  async function openEventPage(event) {
    setOpeningEventId(event.id);
    setError("");

    try {
      const res = await fetch("http://localhost:5001/api/events/import-ticketmaster", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(buildImportPayload(event)),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to open event page");
        return;
      }

      navigate(`/events/${data._id}`);
    } catch (error) {
      console.error(error);
      setError("Failed to open event page");
    } finally {
      setOpeningEventId("");
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-gray-200  p-6 shadow-sm">

      <form className="flex gap-3" onSubmit={handleSubmit}>
        <div className="relative max-w-200 w-full">

        <input
          className=" w-full rounded-full bg-black/5  px-4 py-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          placeholder="Search concerts, games, or shows"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className=" absolute top-1/2 -translate-y-1/2 right-1.5 bg-[#b35119] p-2.5  rounded-full  text-sm font-medium text-white transition hover:bg-stone-800 disabled:bg-stone-400"
        >
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
</svg>

        </button>
        </div>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      

      <div className="grid gap-4 md:grid-cols-2">
        {events.map((event) => (
          <article
            key={event.id}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title || "Ticketmaster event"}
                className="h-48 w-full object-cover"
              />
            ) : (
              <div className="flex h-48 items-center justify-center bg-gray-100 text-sm text-gray-500">
                No image available
              </div>
            )}

            <div className="space-y-2 p-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {event.title || "Untitled event"}
              </h3>
              <p className="text-sm text-gray-500">
                {event.start || "Date and time unavailable"}
              </p>
              <p className="text-sm text-gray-600">
                {event.venue || "Venue unavailable"}
                {event.city ? `, ${event.city}` : ""}
                {event.stateOrProvince ? `, ${event.stateOrProvince}` : ""}
                {event.country ? `, ${event.country}` : ""}
              </p>
              <p className="text-sm text-gray-500">
                {event.classification || "Classification unavailable"}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openEventPage(event)}
                  disabled={openingEventId === event.id}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:bg-gray-100"
                >
                  {openingEventId === event.id ? "Opening..." : "Open Event Page"}
                </button>
                <a
                  href={event.url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View on Ticketmaster
                </a>
              </div>

              <GoingSoloButton importPayload={buildImportPayload(event)} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
