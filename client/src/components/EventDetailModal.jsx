import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
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
  onPrevious = null,
  onNext = null,
  hasPrevious = false,
  hasNext = false,
}) {
  const [attendees, setAttendees] = useState(event?.soloPreviewUsers || []);
  const [attendeeCount, setAttendeeCount] = useState(event?.soloAttendeeCount || 0);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(modalEvent) {
      if (modalEvent.key === "Escape") {
        onClose();
      }
    }

    const scrollY = window.scrollY;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyWidth = document.body.style.width;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.width = previousBodyWidth;
      document.removeEventListener("keydown", handleKeyDown);
      window.scrollTo(0, scrollY);
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

  useEffect(() => {
    if (isOpen) {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [event?.externalId, event?._id, isOpen]);

  if (!event) {
    return null;
  }

  const owner = event.createdBy || event.userId;
  const eventPageButton = onOpenEventPage ? (
    <button
      type="button"
      onClick={onOpenEventPage}
      disabled={openingEventPage}
      className="inline-flex h-9 items-center justify-center rounded-[0.1rem] border border-red-900/80 bg-white px-3.5 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {openingEventPage ? "Opening..." : "Open Event Page"}
    </button>
  ) : event._id ? (
    <Link
      to={`/events/${event._id}`}
      className="inline-flex h-9 items-center justify-center  rounded-[0.8rem] border border-stone-300/80 bg-white px-3.5 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 hover:text-stone-950"
    >
      Open Event Page
    </Link>
  ) : null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Close event details"
        onClick={onClose}
        className={`absolute inset-0 backdrop-blur-[2px] transition-opacity duration-200 ${
          isOpen ? "opacity-100 bg-stone-950/60" : "opacity-0 bg-stone-950/0"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[1.75rem]  bg-stone-100 shadow-[0_30px_100px_rgba(15,23,42,0.32)] transition-all duration-200 ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-95 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-stone-200 bg-stone-100/95 px-4 py-3 backdrop-blur-sm">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-9 items-center justify-center rounded-[1rem] border border-stone-300/80 bg-stone-50 text-stone-700 transition hover:border-stone-400 hover:bg-white hover:text-stone-950"
              aria-label="Close event details"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                className="size-3.5"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M3.47 3.47a.75.75 0 0 1 1.06 0L8 6.94l3.47-3.47a.75.75 0 1 1 1.06 1.06L9.06 8l3.47 3.47a.75.75 0 0 1-1.06 1.06L8 9.06l-3.47 3.47a.75.75 0 0 1-1.06-1.06L6.94 8 3.47 4.53a.75.75 0 0 1 0-1.06"
                />
              </svg>
            </button>
            {eventPageButton}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrevious}
              disabled={!hasPrevious}
              className="inline-flex size-9 items-center justify-center rounded-[1rem] border border-stone-300/80 bg-stone-50 text-stone-700 transition hover:border-stone-400 hover:bg-white hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-45"
              aria-label="Previous event"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-4"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.78 4.22a.75.75 0 0 1 0 1.06L8.06 10l4.72 4.72a.75.75 0 1 1-1.06 1.06l-5.25-5.25a.75.75 0 0 1 0-1.06l5.25-5.25a.75.75 0 0 1 1.06 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!hasNext}
              className="inline-flex size-9 items-center justify-center rounded-[1rem] border border-stone-300/80 bg-stone-50 text-stone-700 transition hover:border-stone-400 hover:bg-white hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-45"
              aria-label="Next event"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-4"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.22 15.78a.75.75 0 0 1 0-1.06L11.94 10 7.22 5.28a.75.75 0 0 1 1.06-1.06l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 0 1-1.06 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto bg-white">
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
          </div>

          <div className="px-6 py-6 md:px-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-sm font-medium text-stone-500">
                  {formatEventDateTimeDetail(event.startDate)}
                </p>
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold tracking-tight text-stone-950">
                    {event.title || "Untitled event"}
                  </h2>
                  <p className="text-base text-stone-600">{formatEventLocation(event)}</p>
                </div>
              </div>

              <div className="flex flex-col gap-6 border-t border-stone-200 pt-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold  text-stone-400">
                      About
                    </p>
                    <p className="text-sm  text-stone-700">
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
                    </div>
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
