import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  formatEventDateRangeParts,
  formatEventLocationParts,
} from "../utils/eventFormatting";
import { getUserDisplayName } from "../utils/avatar";
import SoloAttendeeSummary from "./SoloAttendeeSummary";
import GoingSoloButton from "./GoingSoloButton";
import UserAvatar from "./UserAvatar";
import EventSettingsMenu from "./EventSettingsMenu";
import EventMap from "./EventMap";
import FavoriteButton from "./FavoriteButton";

function CalendarIcon({ className = "size-12" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18h-10.5A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Z" />
      <path
        fill="#fff"
        d="M3.5 8h13v7.25c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25V8Z"
      />
    </svg>
  );
}

function PinIcon({ className = "size-12" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 1.75a5.75 5.75 0 0 0-5.75 5.75c0 4.23 4.6 8.93 5.13 9.45a.9.9 0 0 0 1.24 0c.53-.52 5.13-5.22 5.13-9.45A5.75 5.75 0 0 0 10 1.75Zm0 7.75a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function EventDetailModal({
  event,
  isOpen,
  onClose,
  refresh,
  token,
  importPayload = null,
  onOpenEventPage = null,
  openingEventPage = false,
  onEventChange = null,
  onAttendeesChange = null,
  onPrevious = null,
  onNext = null,
  hasPrevious = false,
  hasNext = false,
}) {
  const [attendeeState, setAttendeeState] = useState({
    eventKey: event?._id || event?.externalId || null,
    attendees: event?.soloPreviewUsers || [],
    attendeeCount: event?.soloAttendeeCount || 0,
  });
  const scrollContainerRef = useRef(null);

  useEffect(() => {
  if (!isOpen) return;

  function handleKeyDown(e) {
    if (e.key === "Escape") onClose();
  }

  const scrollY = window.scrollY;

  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = "100%";

  document.addEventListener("keydown", handleKeyDown);

  return () => {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";

    document.removeEventListener("keydown", handleKeyDown);

    window.scrollTo(0, scrollY);
  };
}, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [event?.externalId, event?._id, isOpen]);

  if (!event) {
    return null;
  }

  const owner = event.createdBy || event.userId;
  const eventKey = event._id || event.externalId || null;
  const usingLocalAttendees = attendeeState.eventKey === eventKey;
  const attendees = usingLocalAttendees
    ? attendeeState.attendees
    : event.soloPreviewUsers || [];
  const attendeeCount = usingLocalAttendees
    ? attendeeState.attendeeCount
    : event.soloAttendeeCount || 0;
  const dateTimeParts = formatEventDateRangeParts(
    event.startDate,
    event.endDate,
  );
  const locationParts = formatEventLocationParts(event);
  const locationURL = encodeURIComponent(locationParts.mapsQuery);
  const eventPageButton = event._id ? (
    <Link
      to={`/events/${event._id}`}
      className="inline-flex h-9 items-center justify-center  rounded-[0.8rem] border border-stone-300/80 bg-white px-3.5 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 hover:text-stone-950"
    >
      Open Event Page
    </Link>
  ) : onOpenEventPage ? (
    <button
      type="button"
      onClick={onOpenEventPage}
      className="inline-flex h-9 items-center justify-center rounded-[0.8rem] border border-stone-300/80 bg-white px-3.5 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 hover:text-stone-950"
    >
      {openingEventPage ? "Opening..." : "Open Event Page"}
    </button>
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
        className={`relative z-10 flex max-h-[97vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl  bg-stone-100 shadow-[0_30px_100px_rgba(15,23,42,0.32)] transition-all duration-200 ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-2 scale-95 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-stone-200 bg-stone-100/95 px-4 py-3 backdrop-blur-sm">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-9 items-center justify-center squircle rounded-full border border-stone-300/80 bg-stone-50 text-stone-700 transition hover:border-stone-400 hover:bg-white hover:text-stone-950"
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
            <EventSettingsMenu
              event={event}
              onBeforeNavigate={onClose}
              onDeleted={() => {
                onClose();
                refresh?.();
              }}
            />
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

        <div
          ref={scrollContainerRef}
          className="min-h-0 flex-1 overflow-y-auto bg-white"
        >
          <div className="">
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
              
              <div className="space-y-2">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {event.source ? (
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-[14px] font-semibold capitalize text-stone-500">
                      {event.source}
                    </span>
                  ) : null}
                  <FavoriteButton
                    event={event}
                    token={token}
                    importPayload={importPayload}
                    onChange={onEventChange}
                  />
                </div>
                <h2 className="text-3xl font-semibold tracking-tight text-stone-950">
                  {event.title || "Untitled event"}
                </h2>
                
                <div>
                  {owner ? (
                    <div className="mt-3 flex items-center gap-2">
                      <UserAvatar
                        user={owner}
                        size={24}
                        className="h-10 w-10"
                        textClassName="text-xs"
                      />
                      <div>
                        <p className="text-base font-medium text-black/60">
                          {getUserDisplayName(owner)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-stone-500">
                      Host unavailable
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-6 border-t border-stone-200 pt-6">
                <div className="space-y-5">
                  <div className=" grid grid-cols-[1fr_1.4fr] ">
                    <div className="flex items-start gap-3 text-sm text-stone-700">
                      <CalendarIcon className="mt-0.5 size-10 shrink-0 text-stone-400" />
                      <div className="flex flex-col">
                        <p className="text-base font-semibold text-stone-950">
                          {dateTimeParts.primaryText}
                        </p>
                        {dateTimeParts.secondaryText ? (
                          <p className="text-sm text-stone-500">
                            {dateTimeParts.secondaryText}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-start gap-1  text-sm text-stone-700">
                      <PinIcon className="mt-0.5 size-10 shrink-0 text-stone-400" />
                      <div className="space-y-1">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${locationURL}`}
                        >
                          <p className="text-base font-semibold text-stone-950">
                            {locationParts.primaryText}
                          </p>
                        </a>
                        {locationParts.secondaryText ? (
                          <p className="text-sm text-stone-500">
                            {locationParts.secondaryText}
                          </p>
                        ) : null}
                        {event.source === "ticketmaster" && event.classification ? (
                          <p className="text-sm font-medium text-stone-500">
                            {event.classification}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                   <div className=" mb-8 bg-black/5 rounded-lg p-4">
                  <div>
                    <p className="text-sm font-semibold text-stone-400">
                      People Going Solo
                    </p>
                    <div className="mt-3 space-y-3">
                      <SoloAttendeeSummary
                        attendees={attendees}
                        count={attendeeCount}
                      />
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
                            setAttendeeState({
                              eventKey,
                              attendees: nextAttendees,
                              attendeeCount: nextAttendees.length,
                            });
                            onAttendeesChange?.(nextAttendees);
                          }}
                          fullWidth
                          showAttendeeSummary={false}
                          showOpenEventPage={false}
                        />
                      ) : (
                        <p className="text-sm text-stone-500">
                          Log in to join this event solo.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold  text-stone-400">
                      About
                    </p>
                    <p className="text-sm  text-stone-700">
                      {event.description || "No description available yet."}
                    </p>
                  </div>
                </div>

               

                <div>
                  <p className="text-sm font-semibold pb-4 text-stone-400">
                    Location
                  </p>

                  <EventMap
                    lat={event.location?.lat}
                    lng={event.location?.lng}
                    address={event.location?.address}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
