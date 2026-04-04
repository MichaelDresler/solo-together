import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import { createAuthHeaders, getApiUrl } from "../lib/api";
import { canManageEvent } from "../lib/permissions";

export default function EventSettingsMenu({
  event,
  onDeleted = null,
  onBeforeNavigate = null,
  className = "",
}) {
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef(null);

  const canManage = canManageEvent(user, event);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handlePointerDown(pointerEvent) {
      if (!menuRef.current?.contains(pointerEvent.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(keyEvent) {
      if (keyEvent.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!canManage || !event?._id || !token) {
    return null;
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${event.title || "this event"}"? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch(getApiUrl(`/api/events/${event._id}`), {
        method: "DELETE",
        headers: createAuthHeaders(token),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete event");
      }

      setIsOpen(false);
      onDeleted?.(event);
    } catch (error) {
      window.alert(error.message || "Failed to delete event");
    } finally {
      setIsDeleting(false);
    }
  }

  function handleEdit() {
    setIsOpen(false);
    onBeforeNavigate?.();
    navigate(`/events/${event._id}/edit`);
  }

  return (
    <div
      className={`relative ${isOpen ? "z-30" : "z-10"} ${className}`.trim()}
      ref={menuRef}
    >
      <button
        type="button"
        aria-label="Event settings"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex size-9 items-center justify-center rounded-[1rem] border border-stone-300/80 bg-stone-50 text-stone-700 transition hover:border-stone-400 hover:bg-white hover:text-stone-950"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
      </button>

      <div
        role="menu"
        className={`absolute right-0 top-full z-40 mt-2 w-44 rounded-2xl border border-stone-200 bg-white p-1.5 shadow-[0_18px_40px_rgba(15,23,42,0.16)] transition-all duration-150 ${
          isOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={handleEdit}
          className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-950"
        >
          Edit event
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Delete event"}
        </button>
      </div>
    </div>
  );
}
