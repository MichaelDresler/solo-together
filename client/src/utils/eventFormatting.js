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

const DETAIL_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

function parseEventDate(dateValue) {
  if (!dateValue) {
    return null;
  }

  const date = new Date(dateValue);
  return Number.isNaN(date.valueOf()) ? null : date;
}

function hasExplicitTime(dateValue) {
  return String(dateValue).includes("T");
}

function isSameCalendarDay(leftDate, rightDate) {
  return (
    leftDate.getFullYear() === rightDate.getFullYear() &&
    leftDate.getMonth() === rightDate.getMonth() &&
    leftDate.getDate() === rightDate.getDate()
  );
}

export function formatEventStart(dateValue) {
  if (!dateValue) {
    return "Date and time unavailable";
  }

  const date = parseEventDate(dateValue);

  if (!date) {
    return "Date and time unavailable";
  }

  const hasTime = hasExplicitTime(dateValue);
  return hasTime ? DATE_TIME_FORMATTER.format(date) : DATE_FORMATTER.format(date);
}

export function formatEventDateTimeDetail(dateValue) {
  if (!dateValue) {
    return "Unavailable";
  }

  const date = parseEventDate(dateValue);

  if (!date) {
    return "Unavailable";
  }

  const hasTime = hasExplicitTime(dateValue);
  return hasTime ? DETAIL_DATE_TIME_FORMATTER.format(date) : DETAIL_DATE_FORMATTER.format(date);
}

export function formatEventDateRangeDetail(startDateValue, endDateValue) {
  const startDate = parseEventDate(startDateValue);

  if (!startDate) {
    return "Unavailable";
  }

  const startHasTime = hasExplicitTime(startDateValue);
  const endDate = parseEventDate(endDateValue);
  const endHasTime = hasExplicitTime(endDateValue);

  if (!startHasTime) {
    return DETAIL_DATE_FORMATTER.format(startDate);
  }

  if (!endDate || !endHasTime || isSameCalendarDay(startDate, endDate)) {
    return `${DETAIL_DATE_FORMATTER.format(startDate)} ${DETAIL_TIME_FORMATTER.format(startDate)}`;
  }

  return `${DETAIL_DATE_FORMATTER.format(startDate)} ${DETAIL_TIME_FORMATTER.format(startDate)} - ${DETAIL_DATE_FORMATTER.format(endDate)} ${DETAIL_TIME_FORMATTER.format(endDate)}`;
}

export function formatEventLocation(event) {
  const locationParts = [event.locationName, event.city].filter(Boolean);
  return locationParts.join(", ") || "Location unavailable";
}
