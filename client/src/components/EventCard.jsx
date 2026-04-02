import { formatEventLocation, formatEventStart } from "../utils/eventFormatting";
import SoloAttendeeSummary from "./SoloAttendeeSummary";

export default function EventCard({ event, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group overflow-hidden rounded-2xl border border-black/8 bg-white text-left  transition duration-200 cursor-pointer hover:bg-white/20" 
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
        <p className="text-sm font-medium text-stone-500">{formatEventStart(event.startDate)}</p>
        <h3 className="text-[1.25rem] font-semibold tracking-tight text-stone-950">
          {event.title || "Untitled event"}
        </h3>
        <p className="text-sm text-stone-500">{formatEventLocation(event)}</p>
      </div>

      <div className="border-t border-stone-200 px-5 py-4">
        <SoloAttendeeSummary
          attendees={event.soloPreviewUsers || []}
          count={event.soloAttendeeCount || 0}
          compact
        />
      </div>
    </button>
  );
}
