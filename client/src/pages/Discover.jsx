import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import EventList from "../components/EventList";
import TicketmasterSearch from "../components/TicketmasterSearch";

export default function Discover() {
  const { user, token } = useContext(AuthContext);
  const [err, setErr] = useState("");
  const [events, setEvents] = useState([]);

  const [sortBy, setSortBy] = useState("a-z");
  const [filterByUser, setFilterByUser] = useState("all");

  async function loadEvents() {
    try {
      setErr("");

      const res = await fetch("http://localhost:5001/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setErr(data.error || "failed to load events");
        return;
      }

      setEvents(data);
    } catch (e) {
      setErr("failed to load events");
      console.error(e);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  // get unique creators for dropdown
  const uniqueCreators = useMemo(() => {
    const creators = events.map((event) => ({
      id: event.createdBy?._id || event.userId?._id || event.createdBy || event.userId,
      name: event.createdBy?.username || event.userId?.username || "Unknown",
    }));

    return creators.filter(
      (creator, index, self) =>
        index === self.findIndex((c) => c.id === creator.id)
    );
  }, [events]);

  // filter + sort events before rendering
  const displayEvents = useMemo(() => {
    let filtered = [...events];

    if (filterByUser !== "all") {
      filtered = filtered.filter((event) => {
        const creatorId =
          event.createdBy?._id || event.userId?._id || event.createdBy || event.userId;
        return creatorId === filterByUser;
      });
    }

    filtered.sort((a, b) => {
      if (sortBy === "a-z") {
        return a.title.localeCompare(b.title);
      }

      if (sortBy === "z-a") {
        return b.title.localeCompare(a.title);
      }

      return 0;
    });

    return filtered;
  }, [events, sortBy, filterByUser]);

  return (
    <main className="px-6 max-w-[1000px] mx-auto  w-full">

      {err && <p className="text-red-600">{err}</p>}

      <TicketmasterSearch />

      {user && (
        <Link
          to="/create-event"
          className="inline-flex items-center rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
        >
          Create Event
        </Link>
      )}
      <h1 className="text-3xl font-bold capitalize">Discover new events</h1>
      <h2 className="pb-12">Explore popular events near you, browse by category, or check out some of the great community calendars.</h2>
      <div className="flex gap-4">
        <div className="flex flex-col">
          <label htmlFor="sort">Sort</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="a-z">Title: A-Z</option>
            <option value="z-a">Title: Z-A</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="creator">Filter by creator</label>
          <select
            id="creator"
            value={filterByUser}
            onChange={(e) => setFilterByUser(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All events</option>
            {uniqueCreators.map((creator) => (
              <option key={creator.id} value={creator.id}>
                {creator.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <EventList events={displayEvents} refresh={loadEvents} />
    </main>
  );
}
