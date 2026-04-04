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

const DETAIL_COMPACT_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

const DETAIL_COMPACT_END_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
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

  if (!endDate || !endHasTime) {
    return `${DETAIL_DATE_FORMATTER.format(startDate)} ${DETAIL_TIME_FORMATTER.format(startDate)}`;
  }

  if (isSameCalendarDay(startDate, endDate)) {
    return `${DETAIL_DATE_FORMATTER.format(startDate)} ${DETAIL_TIME_FORMATTER.format(startDate)} - ${DETAIL_TIME_FORMATTER.format(endDate)}`;
  }

  return `${DETAIL_DATE_FORMATTER.format(startDate)} ${DETAIL_TIME_FORMATTER.format(startDate)} - ${DETAIL_DATE_FORMATTER.format(endDate)} ${DETAIL_TIME_FORMATTER.format(endDate)}`;
}

export function formatEventDateRangeParts(startDateValue, endDateValue) {
  const startDate = parseEventDate(startDateValue);

  if (!startDate) {
    return {
      primaryText: "Unavailable",
      secondaryText: "",
    };
  }

  const primaryText = DETAIL_COMPACT_DATE_FORMATTER.format(startDate);
  const startHasTime = hasExplicitTime(startDateValue);
  const endDate = parseEventDate(endDateValue);
  const endHasTime = hasExplicitTime(endDateValue);

  if (!startHasTime) {
    return {
      primaryText,
      secondaryText: "",
    };
  }

  if (!endDate || !endHasTime) {
    return {
      primaryText,
      secondaryText: DETAIL_TIME_FORMATTER.format(startDate),
    };
  }

  if (isSameCalendarDay(startDate, endDate)) {
    return {
      primaryText,
      secondaryText: `${DETAIL_TIME_FORMATTER.format(startDate)} - ${DETAIL_TIME_FORMATTER.format(endDate)}`,
    };
  }

  return {
    primaryText,
    secondaryText: `${DETAIL_TIME_FORMATTER.format(startDate)} - ${DETAIL_COMPACT_END_DATE_FORMATTER.format(endDate)} ${DETAIL_TIME_FORMATTER.format(endDate)}`,
  };
}

export function formatEventLocation(event) {
  const structuredAddress = event?.location?.address?.trim();

  if (structuredAddress) {
    return structuredAddress;
  }

  const locationParts = [event.locationName, event.city].filter(Boolean);
  return locationParts.join(", ") || "Location unavailable";
}

export function formatEventLocationParts(event) {
  const structuredAddress = event?.location?.address?.trim();

  if (structuredAddress) {
    const [primarySegment, ...secondarySegments] = structuredAddress
      .split(",")
      .map((segment) => segment.trim())
      .filter(Boolean);

    return {
      primaryText: primarySegment || "Location unavailable",
      secondaryText: secondarySegments.join(", "),
      mapsQuery: structuredAddress,
    };
  }

  const primaryText =
    event?.addressLine1?.trim() ||
    event?.locationName?.trim() ||
    event?.city?.trim() ||
    "Location unavailable";
  const secondaryText = [
    event?.city?.trim(),
    event?.stateOrProvince?.trim(),
    event?.postalCode?.trim(),
    event?.country?.trim(),
  ]
    .filter(Boolean)
    .join(", ");
  const mapsQuery =
    [
      event?.addressLine1?.trim(),
      event?.city?.trim(),
      event?.stateOrProvince?.trim(),
      event?.postalCode?.trim(),
      event?.country?.trim(),
    ]
      .filter(Boolean)
      .join(", ") || primaryText;

  return {
    primaryText,
    secondaryText,
    mapsQuery,
  };
}
