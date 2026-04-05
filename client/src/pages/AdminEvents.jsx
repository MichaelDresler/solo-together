import { useCallback, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import { AuthContext } from "../context/auth-context";
import { createAuthHeaders, getApiUrl } from "../lib/api";
import { canManageMembers } from "../lib/permissions";

export function AdminEventsSection() {
  const { token, user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingEventId, setDeletingEventId] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(getApiUrl("/api/events?source=internal"), {
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
    if (!canManageMembers(user)) {
      setLoading(false);
      return;
    }

    loadEvents();
  }, [loadEvents, user]);

  async function deleteEvent() {
    if (!pendingDelete) {
      return;
    }

    const { eventId } = pendingDelete;
    setDeletingEventId(eventId);
    setError("");

    try {
      const res = await fetch(getApiUrl(`/api/events/${eventId}`), {
        method: "DELETE",
        headers: createAuthHeaders(token),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete event");
      }

      setEvents((currentEvents) =>
        currentEvents.filter((event) => event._id !== eventId),
      );
      setPendingDelete(null);
    } catch (deleteError) {
      setError(deleteError.message || "Failed to delete event");
    } finally {
      setDeletingEventId("");
    }
  }

  if (!canManageMembers(user)) {
    return (
      <main className="w-full p-6">
        <p className="text-red-600">You do not have permission to manage events.</p>
      </main>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-stone-900">Manage Events</h2>
          <p className="max-w-3xl text-sm text-stone-600">
            Review internal events, update listings, create new ones, and remove outdated content.
          </p>
        </div>
      </header>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          Loading events...
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-50">
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-stone-500">
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {events.map((event) => (
                <tr key={event._id}>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-stone-900">{event.title}</p>
                      <p className="text-sm text-stone-500">
                        {event.startDate ? new Date(event.startDate).toLocaleString() : "No date set"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-stone-700">
                    {event.classification || "General"}
                  </td>
                  <td className="px-4 py-4 text-sm text-stone-700">
                    {[event.city, event.country].filter(Boolean).join(", ") || "Unknown"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/events/${event._id}`}
                        className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                      >
                        View
                      </Link>
                      <Link
                        to={`/events/${event._id}/edit`}
                        className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        disabled={deletingEventId === event._id}
                        onClick={() =>
                          setPendingDelete({
                            eventId: event._id,
                            title: event.title || "this event",
                          })
                        }
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingEventId === event._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(pendingDelete)}
        title="Delete event?"
        message={`Delete "${pendingDelete?.title || "this event"}"?`}
        confirmLabel="Delete"
        busy={Boolean(pendingDelete && deletingEventId === pendingDelete.eventId)}
        onConfirm={deleteEvent}
        onCancel={() => {
          if (!deletingEventId) {
            setPendingDelete(null);
          }
        }}
      />
    </div>
  );
}

export default function AdminEvents() {
  const { user } = useContext(AuthContext);

  if (!canManageMembers(user)) {
    return (
      <main className="w-full p-6">
        <p className="text-red-600">You do not have permission to manage events.</p>
      </main>
    );
  }

  return (
    <main className="w-full p-6">
      <div className="mx-auto max-w-6xl">
        <AdminEventsSection />
      </div>
    </main>
  );
}
