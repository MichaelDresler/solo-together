import { useCallback, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EventList from "../components/EventList";
import { AuthContext } from "../context/auth-context";
import { createAuthHeaders, getApiUrl } from "../lib/api";

export default function Home() {
  const { token, user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadFeaturedEvents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(getApiUrl("/api/events?limit=6"), {
        headers: createAuthHeaders(token),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load events");
      }

      setEvents(data);
    } catch (loadError) {
      setError(loadError.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadFeaturedEvents();
  }, [loadFeaturedEvents]);

  return (
    <main className="min-h-screen w-full  px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className=" px-8 py-12 text-black text-center flex flex-col items-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
            SoloTogether
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight">
            Discover events, save the ones you want, and stop going alone
          </h1>
          <p className="mt-4 max-w-2xl text-base text-stone-500">
            Browse public listings, search live event data, and build a personalized member dashboard around your saved plans.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="rounded-full squircle bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              {user ? "Open Your Dashboard" : "Create Account"}
            </Link>
            <Link
              to="/discover"
              className="rounded-full border squircle border-black/15 px-5 py-3 text-sm font-semibold text-black/70 transition hover:bg-white/10"
            >
              Browse Events
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
                Upcoming events
              </h2>
            </div>
            <Link to="/discover" className="text-sm font-semibold text-stone-700 hover:text-stone-950">
              View all events
            </Link>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {loading ? (
            <div className="rounded-2xl border border-stone-200 bg-white px-6 py-12 text-sm text-stone-500">
              Loading events...
            </div>
          ) : (
            <EventList events={events} refresh={loadFeaturedEvents} />
          )}
        </section>
      </div>
    </main>
  );
}
