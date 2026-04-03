import UserAvatar from "./UserAvatar";

export default function SoloAttendeeSummary({
  attendees = [],
  count = 0,
  maxVisible = 3,
  compact = false,
}) {
  const visibleAttendees = attendees.slice(0, maxVisible);
  const remainingCount = Math.max(count - visibleAttendees.length, 0);

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center">
        {visibleAttendees.length > 0 ? (
          <div className="flex -space-x-2.5">
            {visibleAttendees.map((person) => (
              <UserAvatar
                key={person._id || person.username}
                user={person}
                size={compact ? 28 : 34}
                className={`${compact ? "h-7 w-7" : "h-8 w-8"} border-2 border-white shadow-sm`}
                textClassName="text-[10px]"
              />
            ))}

            {remainingCount > 0 && (
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-stone-200 text-xs font-semibold text-stone-700 shadow-sm">
                +{remainingCount}
              </span>
            )}
          </div>
        ) : (
          <div className="rounded-full border border-dashed border-stone-300 px-3 py-1 text-xs font-medium text-stone-500">
            No one yet
          </div>
        )}
      </div>

      <div className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-[#CF5812]">
        {count} Going Solo
      </div>
    </div>
  );
}
