import { formatEventLocation, formatEventStart } from "../utils/eventFormatting";
import SoloAttendeeSummary from "./SoloAttendeeSummary";
import FavoriteButton from "./FavoriteButton";

export default function EventCard({
  event,
  onOpen,
  token = null,
  importPayload = null,
  onEventChange = null,
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-black/8 bg-white transition duration-200 hover:bg-white/20">
      <div className="relative">
        <button
          type="button"
          onClick={onOpen}
          className="group block w-full cursor-pointer text-left"
        >
          {event.imageUrl ? (
            <div className="overflow-hidden">
              <img
                src={event.imageUrl}
                alt={event.title || "Event"}
                className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            </div>
          ) : (
            <div className="flex h-56 w-full items-center justify-center bg-stone-100 text-sm font-medium text-stone-500">
              No event image available
            </div>
          )}

          <div className="space-y-3 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-stone-500">
                {formatEventStart(event.startDate)}
              </p>
              {event.source ? (
                <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                  {event.source}
                </span>
              ) : null}
            </div>
            <h3 className="line-clamp-2 text-[1.25rem] font-semibold tracking-tight text-stone-950">
              {event.title || "Untitled event"}
            </h3>
            <p className="line-clamp-2 text-sm text-stone-600">
              {event.description || "No description available yet."}
            </p>
            <p className="line-clamp-1 text-sm text-stone-500">
              {formatEventLocation(event)}
            </p>
          </div>
        </button>

        {token ? (
          <FavoriteButton
            event={event}
            token={token}
            importPayload={importPayload}
            onChange={onEventChange}
            className="absolute right-4 top-4 shadow-sm"
          />
        ) : null}
      </div>

      <div className="border-t border-stone-200 px-5 py-4">
        <div className="mb-3 flex items-center justify-between gap-3 text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
          <span>{event.classification || "General"}</span>
          {event.city ? <span>{event.city}</span> : null}
        </div>
        <SoloAttendeeSummary
          attendees={event.soloPreviewUsers || []}
          count={event.soloAttendeeCount || 0}
          compact
        />
      </div>
    </article>
  );
}
