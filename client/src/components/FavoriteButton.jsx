import { useState } from "react";
import { createAuthHeaders, getApiUrl } from "../lib/api";

export default function FavoriteButton({
  event,
  token,
  importPayload = null,
  onChange = null,
  className = "",
}) {
  const [loading, setLoading] = useState(false);

  if (!token) {
    return null;
  }

  async function ensureLocalEventId() {
    if (event._id) {
      return event._id;
    }

    if (!importPayload) {
      throw new Error("Event must be imported before it can be saved.");
    }

    const importRes = await fetch(getApiUrl("/api/events/import-ticketmaster"), {
      method: "POST",
      headers: createAuthHeaders(token, {
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(importPayload),
    });
    const importData = await importRes.json();

    if (!importRes.ok) {
      throw new Error(importData.error || "Failed to save event");
    }

    onChange?.({
      ...event,
      _id: importData._id,
      isFavorited: false,
      createdBy: importData.createdBy || event.createdBy,
      userId: importData.userId || event.userId,
    });

    return importData._id;
  }

  async function handleToggleFavorite() {
    setLoading(true);

    try {
      const eventId = await ensureLocalEventId();
      const shouldFavorite = !event.isFavorited;
      const res = await fetch(getApiUrl(`/api/events/${eventId}/favorite`), {
        method: shouldFavorite ? "POST" : "DELETE",
        headers: createAuthHeaders(token),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update saved event");
      }

      onChange?.({
        ...event,
        _id: eventId,
        isFavorited: data.isFavorited,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleToggleFavorite}
      className={`inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs font-medium transition ${
        event.isFavorited
          ? "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
          : "border-stone-300 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50"
      } disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      aria-pressed={event.isFavorited}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill={event.isFavorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        className="size-4"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 4.75A1.75 1.75 0 0 1 5.5 3h9A1.75 1.75 0 0 1 16.25 4.75v11.5L10 12.5l-6.25 3.75z"
        />
      </svg>
      {loading ? "Saving..." : event.isFavorited ? "Saved" : "Save"}
    </button>
  );
}
