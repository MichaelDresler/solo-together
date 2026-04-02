const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

const DETAIL_DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const DETAIL_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function formatEventStart(dateValue) {
  if (!dateValue) {
    return "Date and time unavailable";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.valueOf())) {
    return "Date and time unavailable";
  }

  const hasTime = String(dateValue).includes("T");
  return hasTime ? DATE_TIME_FORMATTER.format(date) : DATE_FORMATTER.format(date);
}

export function formatEventDateTimeDetail(dateValue) {
  if (!dateValue) {
    return "Unavailable";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.valueOf())) {
    return "Unavailable";
  }

  const hasTime = String(dateValue).includes("T");
  return hasTime ? DETAIL_DATE_TIME_FORMATTER.format(date) : DETAIL_DATE_FORMATTER.format(date);
}

export function formatEventLocation(event) {
  const locationParts = [event.locationName, event.city].filter(Boolean);
  return locationParts.join(", ") || "Location unavailable";
}
