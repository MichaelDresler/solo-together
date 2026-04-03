import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TicketmasterResults from "../components/TicketmasterResults";
import useTicketmasterEventSearch from "../components/useTicketmasterEventSearch";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { events, error, loading, hasQuery, setEvents } = useTicketmasterEventSearch(query);
  const [sortBy, setSortBy] = useState("date-asc");
  const [filterByCategory, setFilterByCategory] = useState("all");

  const categories = useMemo(() => {
    const nextCategories = events
      .map((event) => event.classification?.trim())
      .filter(Boolean);

    return [...new Set(nextCategories)].sort((a, b) => a.localeCompare(b));
  }, [events]);

  const displayEvents = useMemo(() => {
    let filtered = [...events];

    if (filterByCategory !== "all") {
      filtered = filtered.filter((event) => event.classification === filterByCategory);
    }

    filtered.sort((a, b) => {
      if (sortBy === "title-asc") {
        return a.title.localeCompare(b.title);
      }

      if (sortBy === "title-desc") {
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
  }, [events, filterByCategory, sortBy]);

  const emptyState = !hasQuery ? (
    <div className="rounded-[1.75rem] border border-dashed border-stone-300 bg-stone-50 px-8 py-14 text-center">
      <p className="text-2xl font-semibold tracking-tight text-stone-900">Search for live events</p>
      <p className="mt-2 text-sm text-stone-500">
        Use the global search button or press Cmd/Ctrl+K to look up concerts, games, and shows.
      </p>
    </div>
  ) : !loading && !error && !displayEvents.length ? (
    <div className="rounded-[1.75rem] border border-dashed border-stone-300 bg-stone-50 px-8 py-14 text-center">
      <p className="text-2xl font-semibold tracking-tight text-stone-900">No results for “{query}”</p>
      <p className="mt-2 text-sm text-stone-500">
        Try a broader artist, team, city, or venue name.
      </p>
    </div>
  ) : null;

  return (
    <main className="mx-auto w-full max-w-[80rem] px-6">
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#CF5812]">
          Ticketmaster Search
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950">
          {hasQuery ? `Results for “${query}”` : "Search events"}
        </h1>
        <p className="mt-3 max-w-3xl text-base text-stone-500">
          Browse live Ticketmaster events with the same card and detail flow as discovery, then open any result as a SoloTogether event page.
        </p>
      </header>

      {error ? <p className="mb-6 text-sm text-red-600">{error}</p> : null}

      {hasQuery ? (
        <div className="mb-8 flex flex-wrap gap-4">
          <div className="flex flex-col">
            <label htmlFor="sort-results" className="text-sm font-medium text-stone-600">
              Sort
            </label>
            <select
              id="sort-results"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="mt-1 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-400"
            >
              <option value="date-asc">Date: Soonest first</option>
              <option value="date-desc">Date: Latest first</option>
              <option value="title-asc">Title: A-Z</option>
              <option value="title-desc">Title: Z-A</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="category-results" className="text-sm font-medium text-stone-600">
              Filter by category
            </label>
            <select
              id="category-results"
              value={filterByCategory}
              onChange={(event) => setFilterByCategory(event.target.value)}
              className="mt-1 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-400"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-[1.75rem] border border-stone-200 bg-white px-8 py-14 text-center text-sm text-stone-500 shadow-sm">
          Loading Ticketmaster events...
        </div>
      ) : (
        <TicketmasterResults events={displayEvents} setEvents={setEvents} emptyState={emptyState} />
      )}
    </main>
  );
}
