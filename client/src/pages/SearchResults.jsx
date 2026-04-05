import { useContext, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TicketmasterResults from "../components/TicketmasterResults";
import useTicketmasterEventSearch from "../components/useTicketmasterEventSearch";
import { AuthContext } from "../context/auth-context";

const filterLabelClass =
  "text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500";
const filterControlClass =
  "mt-1.5 h-10 min-w-[11rem] rounded-2xl border border-stone-200 bg-stone-50 px-3 text-sm text-stone-900 outline-none transition focus:border-stone-300 focus:bg-white";

export default function SearchResults() {
  const { token } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { events, error, loading, hasQuery, setEvents } = useTicketmasterEventSearch(query, token);
  const [sortBy, setSortBy] = useState("date-asc");
  const [filterByCategory, setFilterByCategory] = useState("all");
  const [filterBySource, setFilterBySource] = useState("all");

  const categories = useMemo(() => {
    const nextCategories = events
      .map((event) => event.classification?.trim())
      .filter(Boolean);

    return [...new Set(nextCategories)].sort((a, b) => a.localeCompare(b));
  }, [events]);

  const displayEvents = useMemo(() => {
    let filtered = [...events];

    if (filterBySource !== "all") {
      filtered = filtered.filter((event) => event.source === filterBySource);
    }

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
  }, [events, filterByCategory, filterBySource, sortBy]);

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

        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950">
          {hasQuery ? `Results for “${query}”` : "Search events"}
        </h1>
        <p className="mt-3 max-w-3xl text-base text-stone-500">
          Search SoloTogether listings and Ticketmaster results in one place, then open any match with the same card and detail flow.
        </p>
      </header>

      {error ? <p className="mb-6 text-sm text-red-600">{error}</p> : null}

      {hasQuery ? (
        <div className="mb-8 flex flex-wrap gap-3 rounded-[1.75rem] border border-stone-200 bg-white/90 p-4 shadow-sm">
          <div className="flex flex-col">
            <label htmlFor="sort-results" className={filterLabelClass}>
              Sort
            </label>
            <select
              id="sort-results"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className={filterControlClass}
            >
              <option value="date-asc">Date: Soonest first</option>
              <option value="date-desc">Date: Latest first</option>
              <option value="title-asc">Title: A-Z</option>
              <option value="title-desc">Title: Z-A</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="category-results" className={filterLabelClass}>
              Category
            </label>
            <select
              id="category-results"
              value={filterByCategory}
              onChange={(event) => setFilterByCategory(event.target.value)}
              className={filterControlClass}
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
            <label htmlFor="source-results" className={filterLabelClass}>
              Source
            </label>
            <select
              id="source-results"
              value={filterBySource}
              onChange={(event) => setFilterBySource(event.target.value)}
              className={filterControlClass}
            >
              <option value="all">All sources</option>
              <option value="internal">SoloTogether</option>
              <option value="ticketmaster">Ticketmaster</option>
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
