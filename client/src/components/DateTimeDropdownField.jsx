import { useEffect, useMemo, useRef, useState } from "react";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "long",
  day: "numeric",
});
const TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const totalMinutes = index * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  const labelDate = new Date(2025, 0, 1, hours, minutes);

  return {
    value,
    label: TIME_FORMATTER.format(labelDate),
  };
});

function getTodayDateValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getClampedMonthStart(date, currentMonthStart) {
  if (!date) {
    return currentMonthStart;
  }

  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  return monthStart < currentMonthStart ? currentMonthStart : monthStart;
}

function parseDateValue(value) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCalendarDays(monthDate) {
  const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const leadingDays = startOfMonth.getDay();
  const totalDays = endOfMonth.getDate();
  const calendarDays = [];

  for (let index = 0; index < leadingDays; index += 1) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    calendarDays.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
  }

  while (calendarDays.length % 7 !== 0) {
    calendarDays.push(null);
  }

  return calendarDays;
}

function ChevronIcon({ isOpen }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      className={`size-4 text-stone-400 transition duration-200 ${isOpen ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M3.22 5.97a.75.75 0 0 1 1.06 0L8 9.69l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.22 7.03a.75.75 0 0 1 0-1.06"
      />
    </svg>
  );
}

export default function DateTimeDropdownField({
  label,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
}) {
  const [openMenu, setOpenMenu] = useState(null);
  const containerRef = useRef(null);

  const selectedDate = useMemo(() => parseDateValue(dateValue), [dateValue]);
  const currentMonthStart = useMemo(() => getCurrentMonthStart(), []);
  const minDateValue = useMemo(() => getTodayDateValue(), []);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    getClampedMonthStart(selectedDate, currentMonthStart)
  );

  useEffect(() => {
    if (!openMenu) return undefined;

    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) {
        setOpenMenu(null);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenu]);

  const calendarDays = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);
  const selectedTime = TIME_OPTIONS.find((option) => option.value === timeValue);
  const isCurrentMonth =
    visibleMonth.getFullYear() === currentMonthStart.getFullYear() &&
    visibleMonth.getMonth() === currentMonthStart.getMonth();

  return (
    <div
      ref={containerRef}
      className="  flex flex-row justify-between  "
    >
      <div className=" flex px-2 items-center">
        <p className="text-sm font-medium text-black/60">{label}</p>
      </div>

      <div className=" min-w-0 gap-x-[2px] overflow-visible flex flex-row">
        <div className="relative bg">
            <button
              type="button"
              onClick={() => {
                setOpenMenu((current) => {
                  const nextMenu = current === "date" ? null : "date";

                  if (nextMenu === "date") {
                    const baseDate = selectedDate && formatDateValue(selectedDate) >= minDateValue
                      ? selectedDate
                      : currentMonthStart;
                    setVisibleMonth(new Date(baseDate.getFullYear(), baseDate.getMonth(), 1));
                  }

                  return nextMenu;
                });
              }}
              className="flex w-full min-w-[8rem] items-center justify-between gap-3 px-3 py-2 text-left transition hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CF5812]/30 bg-black/4 rounded-l-md"
            >
              <span>

                <span className="mt-1 block text-sm font-medium text-stone-800">
                  {selectedDate ? DATE_FORMATTER.format(selectedDate) : "Select date"}
                </span>
              </span>
              <ChevronIcon isOpen={openMenu === "date"} />
            </button>

            <div
              className={`absolute shadow-md left-0 top-full z-30 mt-3 w-[20rem] origin-top-left rounded-[1.35rem]  bg-white p-4  transition-all duration-200 ${
                openMenu === "date"
                  ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none -translate-y-1 scale-95 opacity-0"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                {isCurrentMonth ? (
                  <span className="size-9" aria-hidden="true" />
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleMonth((current) => {
                        const previousMonth = new Date(
                          current.getFullYear(),
                          current.getMonth() - 1,
                          1
                        );

                        return previousMonth < currentMonthStart
                          ? currentMonthStart
                          : previousMonth;
                      })
                    }
                    className="inline-flex size-9 items-center justify-center rounded-full  text-stone-500 transition hover:stone-300 hover:text-stone-800"
                    aria-label="Previous month"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      className="size-4"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M9.78 12.03a.75.75 0 0 1-1.06 0L4.47 7.78a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 1 1 1.06 1.06L6.06 7.25l3.72 3.72a.75.75 0 0 1 0 1.06"
                      />
                    </svg>
                  </button>
                )}

                <p className="text-sm font-semibold text-stone-900">
                  {visibleMonth.toLocaleString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setVisibleMonth(
                      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1)
                    )
                  }
                  className="inline-flex size-9 items-center justify-center rounded-full  text-stone-500 transition hover:stone-300 hover:text-stone-800"
                  aria-label="Next month"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    className="size-4"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M6.22 3.47a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06l3.72-3.72-3.72-3.72a.75.75 0 0 1 0-1.06"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-4 grid grid-cols-7 gap-2 text-center">
                {WEEKDAY_LABELS.map((weekday) => (
                  <span
                    key={weekday}
                    className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400"
                  >
                    {weekday}
                  </span>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  if (!day) {
                    return <span key={`empty-${index}`} className="size-10" aria-hidden="true" />;
                  }

                  const dayValue = formatDateValue(day);
                  const isSelected = dayValue === dateValue;
                  const isToday = dayValue === minDateValue;
                  const isDisabled = dayValue < minDateValue;

                  return (
                    <button
                      key={dayValue}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        onDateChange(dayValue);
                        setOpenMenu(null);
                      }}
                      className={`inline-flex size-10 items-center justify-center rounded-full text-sm font-medium transition ${
                        isDisabled
                          ? "cursor-not-allowed text-stone-300"
                          : isSelected
                            ? "bg-stone-900 text-white shadow-sm"
                            : isToday
                              ? "stone-300 text-stone-900 hover:stone-400 hover:bg-stone-50"
                              : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                      }`}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
        </div>

        <div className="relative ">
            <button
              type="button"
              onClick={() => setOpenMenu((current) => (current === "time" ? null : "time"))}
              className="flex w-full min-w-[8rem] items-center justify-between gap-3 px-3 py-2 rounded-r-md text-left transition bg-black/4 hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CF5812]/30 "
            >
              <span>
  
                <span className="mt-1 block text-sm font-medium text-stone-800">
                  {selectedTime ? selectedTime.label : "Select time"}
                </span>
              </span>
              <ChevronIcon isOpen={openMenu === "time"} />
            </button>

            <div
              className={`absolute right-0 top-full z-30 mt-3 w-[15rem] origin-top-right rounded-[1.35rem]  bg-white shadow-md p-2  transition-all duration-200 ${
                openMenu === "time"
                  ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none -translate-y-1 scale-95 opacity-0"
              }`}
            >
              <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => {
                    onTimeChange("");
                    setOpenMenu(null);
                  }}
                  className={`block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                    !timeValue
                      ? "bg-stone-900 text-white"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  No time
                </button>

                {TIME_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onTimeChange(option.value);
                      setOpenMenu(null);
                    }}
                    className={`block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                      option.value === timeValue
                        ? "bg-stone-900 text-white"
                        : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
