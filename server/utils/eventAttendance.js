import SoloAttendance from "../models/SoloAttendance.js";

export async function attachSoloAttendanceSummary(events) {
  const eventIds = events.map((event) => event?._id).filter(Boolean);

  if (eventIds.length === 0) {
    return events;
  }

  const attendances = await SoloAttendance.find({
    eventId: { $in: eventIds },
    status: "going_solo",
  })
    .populate("userId", "username firstName lastName avatarUrl")
    .sort({ createdAt: -1 });

  const attendeeMap = new Map();

  attendances.forEach((attendance) => {
    const eventId = attendance.eventId.toString();
    const currentAttendees = attendeeMap.get(eventId) || [];
    currentAttendees.push(attendance.userId);
    attendeeMap.set(eventId, currentAttendees);
  });

  return events.map((event) => {
    const eventObject =
      typeof event.toObject === "function" ? event.toObject() : { ...event };
    const eventAttendees = attendeeMap.get(event._id.toString()) || [];

    return {
      ...eventObject,
      soloPreviewUsers: eventAttendees.slice(0, 3),
      soloAttendeeCount: eventAttendees.length,
    };
  });
}
