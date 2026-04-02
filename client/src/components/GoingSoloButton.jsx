import { useCallback, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { createAuthHeaders, getApiUrl } from "../lib/api";
import ConfirmationModal from "./ConfirmationModal";
import SoloAttendeeSummary from "./SoloAttendeeSummary";

export default function GoingSoloButton({
  localEventId = null,
  importPayload = null,
  onStatusChange,
  onAttendeesChange,
  attendees: attendeesProp = null,
  attendeeCount: attendeeCountProp = null,
  showAttendeeSummary = true,
  showOpenEventPage = true,
}) {
  const { token, user } = useContext(AuthContext);
  const [resolvedEventId, setResolvedEventId] = useState(localEventId);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  useEffect(() => {
    setResolvedEventId(localEventId);
  }, [localEventId]);

  useEffect(() => {
    if (!Array.isArray(attendeesProp)) {
      return;
    }

    setAttendees(attendeesProp.map((person) => ({ userId: person })));
  }, [attendeesProp]);

  const loadAttendees = useCallback(async (eventId) => {
    try {
      const res = await fetch(getApiUrl(`/api/events/${eventId}/solo-attendees`), {
        headers: createAuthHeaders(token),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load solo attendees");
        return;
      }

      setAttendees(data);
      onAttendeesChange?.(data.map((entry) => entry.userId).filter(Boolean));
    } catch (error) {
      console.error(error);
      setError("Failed to load solo attendees");
    }
  }, [onAttendeesChange, token]);

  useEffect(() => {
    if (!resolvedEventId || !token || Array.isArray(attendeesProp)) return;
    loadAttendees(resolvedEventId);
  }, [attendeesProp, loadAttendees, resolvedEventId, token]);

  async function ensureLocalEventId() {
    if (resolvedEventId) {
      return resolvedEventId;
    }

    if (!importPayload) {
      throw new Error("No local event id or import payload provided");
    }

    const res = await fetch(getApiUrl("/api/events/import-ticketmaster"), {
      method: "POST",
      headers: createAuthHeaders(token, {
        "Content-Type": "application/json",
      }),
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
      const res = await fetch(getApiUrl(`/api/events/${eventId}/solo`), {
        method: "POST",
        headers: createAuthHeaders(token),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to mark going solo");
      }

      await loadAttendees(eventId);
      onStatusChange?.();
    } catch (error) {
      console.error(error);
      setError(error.message || "Failed to mark going solo");
    } finally {
      setLoading(false);
    }
  }

  async function handleLeaveEvent() {
    if (!resolvedEventId) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(getApiUrl(`/api/events/${resolvedEventId}/solo`), {
        method: "DELETE",
        headers: createAuthHeaders(token),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to leave event");
      }

      await loadAttendees(resolvedEventId);
      setShowLeaveModal(false);
      onStatusChange?.();
    } catch (error) {
      console.error(error);
      setError(error.message || "Failed to leave event");
    } finally {
      setLoading(false);
    }
  }

  const currentUserId = user?._id || user?.id;
  const isGoingSolo = attendees.some(
    (attendee) => attendee.userId?._id === currentUserId,
  );
  const attendeeUsers = attendees.map((attendee) => attendee.userId).filter(Boolean);
  const attendeeCount = attendeeCountProp ?? attendeeUsers.length;

  return (
    <>
      <div className="space-y-2 justify-between ">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={
              isGoingSolo ? () => setShowLeaveModal(true) : handleGoingSolo
            }
            disabled={loading}
            className={` ${!isGoingSolo ? "bg-black" : "bg-red-700"} inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed `}
          >
            {loading
              ? isGoingSolo
                ? "Leaving..."
                : "Saving..."
              : isGoingSolo
                ? "Leave Event"
                : "Going Solo"}
          </button>

          {resolvedEventId && showOpenEventPage && (
            <Link
              to={`/events/${resolvedEventId}`}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              Open Event Page
            </Link>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {resolvedEventId && showAttendeeSummary && (
          <div className="space-y-1 text-sm text-gray-600">
            <SoloAttendeeSummary attendees={attendeeUsers} count={attendeeCount} />
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={showLeaveModal}
        title="Leave event?"
        message="Are you sure you want to leave this event?"
        confirmLabel="Leave Event"
        onCancel={() => setShowLeaveModal(false)}
        onConfirm={handleLeaveEvent}
        loading={loading}
      />
    </>
  );
}
