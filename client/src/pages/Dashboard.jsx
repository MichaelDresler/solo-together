import { useCallback, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EventList from "../components/EventList";
import { AuthContext } from "../context/auth-context";
import { createAuthHeaders, getApiUrl } from "../lib/api";

export default function Dashboard() {
  const { user, token } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const [soloingEvents, setSoloingEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [favoritesRes, profileEventsRes] = await Promise.all([
        fetch(getApiUrl("/api/profile/me/favorites"), {
          headers: createAuthHeaders(token),
        }),
        fetch(getApiUrl("/api/profile/me/events"), {
          headers: createAuthHeaders(token),
        }),
      ]);

      const [favoritesData, profileEventsData] = await Promise.all([
        favoritesRes.json(),
        profileEventsRes.json(),
      ]);

      if (!favoritesRes.ok) {
        throw new Error(favoritesData.error || "Failed to load saved events");
      }

      if (!profileEventsRes.ok) {
        throw new Error(profileEventsData.error || "Failed to load your events");
      }

      setFavorites(favoritesData.favorites || []);
      setSoloingEvents(profileEventsData.soloingEvents || []);
    } catch (loadError) {
      setError(loadError.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <main className="w-full p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-stone-200">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#CF5812]">
            Member Dashboard
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-stone-950">
            Welcome back, {user?.firstName || user?.username}
          </h1>
          <p className="mt-3 max-w-2xl text-stone-600">
            Your dashboard is personalized around saved events and the plans you already made.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/discover"
              className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              Discover more events
            </Link>
            <Link
              to="/profile"
              className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              View your profile
            </Link>
          </div>
        </section>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {loading ? (
          <div className="rounded-2xl border border-stone-200 bg-white px-6 py-12 text-sm text-stone-500">
            Loading your dashboard...
          </div>
        ) : (
          <>
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-stone-900">Your Saved Events</h2>
                <p className="text-sm text-stone-600">
                  Favorites are your personalized shortlist across the app.
                </p>
              </div>
              {favorites.length ? (
                <EventList events={favorites} refresh={loadDashboard} />
              ) : (
                <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-6 py-12 text-sm text-stone-500">
                  You have not saved any events yet.
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-stone-900">Upcoming Solo Plans</h2>
                <p className="text-sm text-stone-600">
                  These are the events where you already marked yourself as going solo.
                </p>
              </div>
              {soloingEvents.length ? (
                <EventList events={soloingEvents} refresh={loadDashboard} />
              ) : (
                <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-6 py-12 text-sm text-stone-500">
                  You have not joined any events as a solo attendee yet.
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
