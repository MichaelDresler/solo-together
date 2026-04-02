import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createAuthHeaders, getApiUrl } from "../lib/api";
import { formatEventDateTimeDetail, formatEventLocation } from "../utils/eventFormatting";
import { getUserDisplayName } from "../utils/avatar";
import SoloAttendeeSummary from "./SoloAttendeeSummary";
import GoingSoloButton from "./GoingSoloButton";
import UserAvatar from "./UserAvatar";

export default function EventDetailModal({
  event,
  isOpen,
  onClose,
  refresh,
  token,
  importPayload = null,
  onOpenEventPage = null,
  openingEventPage = false,
  onAttendeesChange = null,
}) {
  const [attendees, setAttendees] = useState(event?.soloPreviewUsers || []);
  const [attendeeCount, setAttendeeCount] = useState(event?.soloAttendeeCount || 0);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [attendeesError, setAttendeesError] = useState("");

  useEffect(() => {
    if (!isOpen || !event?._id || !token) {
      return undefined;
    }

    let isActive = true;

    async function loadAttendees() {
      setLoadingAttendees(true);
      setAttendeesError("");

      try {
        const res = await fetch(getApiUrl(`/api/events/${event._id}/solo-attendees`), {
          headers: createAuthHeaders(token),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load solo attendees");
        }

        if (!isActive) {
          return;
        }

        const nextAttendees = data.map((entry) => entry.userId).filter(Boolean);
        setAttendees(nextAttendees);
        setAttendeeCount(nextAttendees.length);
      } catch (error) {
        if (isActive) {
          setAttendeesError(error.message || "Failed to load solo attendees");
        }
      } finally {
        if (isActive) {
          setLoadingAttendees(false);
        }
      }
    }

    loadAttendees();

    return () => {
      isActive = false;
    };
  }, [event?._id, isOpen, token]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(modalEvent) {
      if (modalEvent.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!event) {
      setAttendees([]);
      setAttendeeCount(0);
      return;
    }

    setAttendees(event.soloPreviewUsers || []);
    setAttendeeCount(event.soloAttendeeCount || 0);
  }, [event]);

  if (!event) {
    return null;
  }

  const owner = event.createdBy || event.userId;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Close event details"
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/55 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.32)] transition-all duration-200 ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-95 opacity-0"
        }`}
      >
        <div className="relative">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title || "Event"}
              className="h-64 w-full object-cover md:h-80"
            />
          ) : (
            <div className="flex h-64 w-full items-center justify-center bg-stone-100 text-sm font-medium text-stone-500 md:h-80">
              No event image available
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 inline-flex size-11 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-sm transition hover:bg-white hover:text-stone-950"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              className="size-4"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M3.47 3.47a.75.75 0 0 1 1.06 0L8 6.94l3.47-3.47a.75.75 0 1 1 1.06 1.06L9.06 8l3.47 3.47a.75.75 0 0 1-1.06 1.06L8 9.06l-3.47 3.47a.75.75 0 0 1-1.06-1.06L6.94 8 3.47 4.53a.75.75 0 0 1 0-1.06"
              />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6 md:px-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-medium text-stone-500">
                {formatEventDateTimeDetail(event.startDate)}
              </p>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold tracking-tight text-stone-950">
                    {event.title || "Untitled event"}
                  </h2>
                  <p className="text-base text-stone-600">{formatEventLocation(event)}</p>
                </div>

                {onOpenEventPage ? (
                  <button
                    type="button"
                    onClick={onOpenEventPage}
                    disabled={openingEventPage}
                    className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {openingEventPage ? "Opening..." : "Open Event Page"}
                  </button>
                ) : event._id ? (
                  <Link
                    to={`/events/${event._id}`}
                    className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-950"
                  >
                    Open Event Page
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="grid gap-6 border-t border-stone-200 pt-6 md:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">
                    About
                  </p>
                  <p className="text-sm leading-7 text-stone-700">
                    {event.description || "No description available yet."}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-stone-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">
                      Start
                    </p>
                    <p className="mt-2 text-sm font-medium text-stone-800">
                      {formatEventDateTimeDetail(event.startDate)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-stone-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">
                      End
                    </p>
                    <p className="mt-2 text-sm font-medium text-stone-800">
                      {formatEventDateTimeDetail(event.endDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-[1.6rem] border border-stone-200 bg-stone-50 p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">
                    Host
                  </p>
                  {owner ? (
                    <div className="mt-3 flex items-center gap-3">
                      <UserAvatar user={owner} size={40} className="h-10 w-10" textClassName="text-xs" />
                      <div>
                        <p className="text-sm font-semibold text-stone-900">
                          {getUserDisplayName(owner)}
                        </p>
                        <p className="text-sm text-stone-500">{formatEventLocation(event)}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-stone-500">Host unavailable</p>
                  )}
                </div>

                <div className="border-t border-stone-200 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">
                    People Going Solo
                  </p>
                  <div className="mt-3 space-y-3">
                    <SoloAttendeeSummary attendees={attendees} count={attendeeCount} />
                    {token ? (
                      <GoingSoloButton
                        localEventId={event._id}
                        importPayload={importPayload}
                        attendees={attendees}
                        attendeeCount={attendeeCount}
                        onStatusChange={async () => {
                          await refresh?.();
                        }}
                        onAttendeesChange={(nextAttendees) => {
                          setAttendees(nextAttendees);
                          setAttendeeCount(nextAttendees.length);
                          onAttendeesChange?.(nextAttendees);
                        }}
                        showAttendeeSummary={false}
                        showOpenEventPage={false}
                      />
                    ) : (
                      <p className="text-sm text-stone-500">Log in to join this event solo.</p>
                    )}
                    {loadingAttendees && (
                      <p className="text-sm text-stone-500">Loading attendees...</p>
                    )}
                    {attendeesError && <p className="text-sm text-red-600">{attendeesError}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
