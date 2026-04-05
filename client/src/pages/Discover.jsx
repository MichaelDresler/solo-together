import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/auth-context";
import EventList from "../components/EventList";
import { createAuthHeaders, getApiUrl } from "../lib/api";

export default function Discover() {
  const { token } = useContext(AuthContext);
  const [err, setErr] = useState("");
  const [events, setEvents] = useState([]);

  const [sortBy, setSortBy] = useState("date-asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterByCategory, setFilterByCategory] = useState("all");
  const [filterByCity, setFilterByCity] = useState("all");
  const [filterBySource, setFilterBySource] = useState("all");

  useEffect(() => {
    let isCancelled = false;

    async function run() {
      try {
        setErr("");

        const params = new URLSearchParams();

        if (searchQuery.trim()) {
          params.set("q", searchQuery.trim());
        }

        if (filterByCategory !== "all") {
          params.set("classification", filterByCategory);
        }

        if (filterByCity !== "all") {
          params.set("city", filterByCity);
        }

        if (filterBySource !== "all") {
          params.set("source", filterBySource);
        }

        const res = await fetch(getApiUrl(`/api/events?${params.toString()}`), {
          headers: createAuthHeaders(token),
        });
        const data = await res.json();

        if (isCancelled) {
          return;
        }

        if (!res.ok) {
          setErr(data.error || "failed to load events");
          return;
        }

        setEvents(data);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setErr("failed to load events");
        console.error(error);
      }
    }

    run();

    return () => {
      isCancelled = true;
    };
  }, [token, searchQuery, filterByCategory, filterByCity, filterBySource]);

  async function loadEvents() {
    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }

    if (filterByCategory !== "all") {
      params.set("classification", filterByCategory);
    }

    if (filterByCity !== "all") {
      params.set("city", filterByCity);
    }

    if (filterBySource !== "all") {
      params.set("source", filterBySource);
    }

    const res = await fetch(getApiUrl(`/api/events?${params.toString()}`), {
      headers: createAuthHeaders(token),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "failed to load events");
    }

    setEvents(data);
  }

  const categories = useMemo(() => {
    const nextCategories = events
      .map((event) => event.classification?.trim())
      .filter(Boolean);

    return [...new Set(nextCategories)].sort((left, right) => left.localeCompare(right));
  }, [events]);

  const cities = useMemo(() => {
    const nextCities = events
      .map((event) => event.city?.trim())
      .filter(Boolean);

    return [...new Set(nextCities)].sort((left, right) => left.localeCompare(right));
  }, [events]);

  const displayEvents = useMemo(() => {
    const filtered = [...events];

    filtered.sort((a, b) => {
      if (sortBy === "a-z") {
        return a.title.localeCompare(b.title);
      }

      if (sortBy === "z-a") {
        return b.title.localeCompare(a.title);
      }

      const aTime = a.startDate ? new Date(a.startDate).getTime() : Number.POSITIVE_INFINITY;
      const bTime = b.startDate ? new Date(b.startDate).getTime() : Number.POSITIVE_INFINITY;

      if (sortBy === "date-desc") {
        return bTime - aTime;
      }

      return aTime - bTime;

    });

    return filtered;
  }, [events, sortBy]);

  return (
    <main className="px-6 max-w-250 mx-auto  w-full">
      {err && <p className="text-red-600">{err}</p>}

      <h1 className="text-3xl font-bold capitalize">Discover new events</h1>
      <h2 className="pb-8 font-medium text-black/60">
        Browse SoloTogether events by keyword, category, city, and source without leaving the page.
      </h2>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="flex flex-col xl:col-span-2">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="border rounded px-3 py-2"
            placeholder="Search by title, description, city, or category"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="sort">Sort</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="date-asc">Date: Soonest first</option>
            <option value="date-desc">Date: Latest first</option>
            <option value="a-z">Title: A-Z</option>
            <option value="z-a">Title: Z-A</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="category">Filter by category</label>
          <select
            id="category"
            value={filterByCategory}
            onChange={(event) => setFilterByCategory(event.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="city">Filter by city</label>
          <select
            id="city"
            value={filterByCity}
            onChange={(event) => setFilterByCity(event.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="source">Filter by source</label>
          <select
            id="source"
            value={filterBySource}
            onChange={(event) => setFilterBySource(event.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All sources</option>
            <option value="internal">SoloTogether</option>
            <option value="ticketmaster">Ticketmaster </option>
          </select>
        </div>
      </div>

      {!displayEvents.length ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-6 py-12 text-center text-stone-500">
          No events match the current filters.
        </div>
      ) : null}

      <EventList events={displayEvents} refresh={loadEvents} />
    </main>
  );
}
