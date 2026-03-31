import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function GoingSoloButton({
  localEventId = null,
  importPayload = null,
}) {
  const { token, user } = useContext(AuthContext);
  const [resolvedEventId, setResolvedEventId] = useState(localEventId);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setResolvedEventId(localEventId);
  }, [localEventId]);

  useEffect(() => {
    if (!resolvedEventId || !token) return;
    loadAttendees(resolvedEventId);
  }, [resolvedEventId, token]);

  async function loadAttendees(eventId) {
    try {
      const res = await fetch(
        `http://localhost:5001/api/events/${eventId}/solo-attendees`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load solo attendees");
        return;
      }

      setAttendees(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load solo attendees");
    }
  }

  async function ensureLocalEventId() {
    if (resolvedEventId) {
      return resolvedEventId;
    }

    if (!importPayload) {
      throw new Error("No local event id or import payload provided");
    }

    const res = await fetch("http://localhost:5001/api/events/import-ticketmaster", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(importPayload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to import Ticketmaster event");
    }

    setResolvedEventId(data._id);
    return data._id;
  }

  async function handleGoingSolo() {
    setLoading(true);
    setError("");

    try {
      const eventId = await ensureLocalEventId();
      const res = await fetch(`http://localhost:5001/api/events/${eventId}/solo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to mark going solo");
      }

      await loadAttendees(eventId);
    } catch (error) {
      console.error(error);
      setError(error.message || "Failed to mark going solo");
    } finally {
      setLoading(false);
    }
  }

  const currentUserId = user?._id || user?.id;
  const isGoingSolo = attendees.some(
    (attendee) => attendee.userId?._id === currentUserId
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleGoingSolo}
          disabled={loading || isGoingSolo}
          className="inline-flex items-center justify-center rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:bg-stone-400"
        >
          {loading ? "Saving..." : isGoingSolo ? "Going Solo" : "Going Solo"}
        </button>

        {resolvedEventId && (
          <Link
            to={`/events/${resolvedEventId}`}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            Open Event Page
          </Link>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {resolvedEventId && (
        <div className="space-y-1 text-sm text-gray-600">
          <p>
            {attendees.length} {attendees.length === 1 ? "person" : "people"} going solo
          </p>
          {attendees.length > 0 && (
            <p>
              {attendees
                .map((attendee) => attendee.userId?.username || "Unknown")
                .join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
