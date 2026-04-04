import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import GoingSoloButton from "../components/GoingSoloButton";
import SoloAttendeeSummary from "../components/SoloAttendeeSummary";
import UserAvatar from "../components/UserAvatar";
import { getUserDisplayName } from "../utils/avatar";
import EventSettingsMenu from "../components/EventSettingsMenu";
import EventMap from "../components/EventMap";
import FavoriteButton from "../components/FavoriteButton";
import {
  formatEventDateRangeParts,
  formatEventLocationParts,
} from "../utils/eventFormatting";
import { createAuthHeaders, getApiUrl } from "../lib/api";

function CalendarIcon({ className = "size-4" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18h-10.5A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Z" />
      <path fill="#fff" d="M3.5 8h13v7.25c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25V8Z" />
    </svg>
  );
}

function PinIcon({ className = "size-4" }) {
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

export default function EventDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(location.state?.toast || "");
  const [attendeeState, setAttendeeState] = useState({
    eventKey: null,
    attendees: [],
    attendeeCount: 0,
  });

  useEffect(() => {
    if (!location.state?.toast) return;
    navigate(location.pathname, { replace: true });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    async function loadEvent() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(getApiUrl(`/api/events/${id}`), {
          headers: createAuthHeaders(token),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load event");
          setEvent(null);
          return;
        }

        setEvent(data);
      } catch (error) {
        console.error(error);
        setError("Failed to load event");
        setEvent(null);
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [id, token]);

  if (loading) {
    return (
      <main className="w-full px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-[1.75rem] border border-stone-200 bg-stone-100 p-8 text-sm font-medium text-stone-600 shadow-[0_30px_100px_rgba(15,23,42,0.12)]">
          Loading event...
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="w-full px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-[1.75rem] border border-red-200 bg-red-50 p-8 text-sm font-medium text-red-700 shadow-[0_30px_100px_rgba(15,23,42,0.08)]">
          {error || "Event not found"}
        </div>
      </main>
    );
  }

  const owner = event.createdBy || event.userId;
  const eventKey = event._id || event.externalId || null;
  const usingLocalAttendees = attendeeState.eventKey === eventKey;
  const attendees = usingLocalAttendees
    ? attendeeState.attendees
    : (event.soloPreviewUsers || []);
  const attendeeCount = usingLocalAttendees
    ? attendeeState.attendeeCount
    : (event.soloAttendeeCount || 0);
  const dateTimeParts = formatEventDateRangeParts(event.startDate, event.endDate);
  const locationParts = formatEventLocationParts(event);
  const locationURL = encodeURIComponent(locationParts.mapsQuery);

  return (
    <main className="w-full px-4  sm:px-6  lg:px-8">
      <div className="mx-auto max-w-2xl space-y-4">
        {toast && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm">
            <span>{toast}</span>
            <button
              type="button"
              onClick={() => setToast("")}
              className="font-semibold text-emerald-700 transition hover:text-emerald-900"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-[1.75rem]  ">
          <div className="flex items-center justify-between gap-3 border-b border-stone-200 bg-stone-100/95 px-4 py-3 backdrop-blur-sm sm:px-5">
            <div className="flex min-w-0 items-center gap-2">
              {event.externalUrl ? (
                <a
                  href={event.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center justify-center rounded-[0.8rem] border border-stone-300/80 bg-white px-3.5 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 hover:text-stone-950"
                >
                  View Original Event
                </a>
              ) : null}
            </div>

            <EventSettingsMenu event={event} onDeleted={() => navigate("/discover")} />
          </div>

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

            <div className="px-6 py-6 md:px-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-semibold tracking-tight text-stone-950">
                          {event.title || "Untitled event"}
                        </h1>
                        {event.source ? (
                          <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                            {event.source}
                          </span>
                        ) : null}
                        <FavoriteButton
                          event={event}
                          token={token}
                          onChange={(nextEvent) =>
                            setEvent((currentEvent) => ({
                              ...currentEvent,
                              ...nextEvent,
                            }))
                          }
                        />
                      </div>

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
                          {event.classification ? (
                            <p className="text-sm font-medium text-stone-500">
                              {event.classification}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>

                     <div className="space-y-4 bg-black/5 rounded-lg p-4">
                    <div>
                      <p className="text-sm font-semibold text-stone-400">
                        People Going Solo
                      </p>
                      <div className="mt-3 space-y-3">
                        <SoloAttendeeSummary
                          attendees={attendees}
                          count={attendeeCount}
                        />
                        <GoingSoloButton
                          localEventId={event._id}
                          attendees={attendees}
                          attendeeCount={attendeeCount}
                          onAttendeesChange={(nextAttendees) => {
                            setAttendeeState({
                              eventKey,
                              attendees: nextAttendees,
                              attendeeCount: nextAttendees.length,
                            });
                          }}
                          fullWidth
                          showAttendeeSummary={false}
                          showOpenEventPage={false}
                        />
                      </div>
                    </div>
                  </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-stone-400">
                        About
                      </p>
                      <p className="text-sm text-stone-700">
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
    </main>
  );
}
