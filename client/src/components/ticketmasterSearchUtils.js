export function buildImportPayload(event) {
  return {
    externalId: event.externalId,
    title: event.title,
    description: event.description || "",
    startDate: event.startDate || null,
    endDate: event.endDate || null,
    locationName: event.locationName || "",
    addressLine1: event.addressLine1 || "",
    city: event.city || "",
    stateOrProvince: event.stateOrProvince || "",
    postalCode: event.postalCode || "",
    country: event.country || "",
    classification: event.classification || "",
    imageUrl: event.imageUrl || "",
    externalUrl: event.externalUrl || "",
  };
}

export function normalizeTicketmasterEvent(event) {
  return {
    _id: event._id || null,
    externalId: event.id || "",
    source: "ticketmaster",
    externalSource: "ticketmaster",
    title: event.title || "",
    description: event.description || "",
    startDate: event.start || "",
    endDate: event.end || "",
    locationName: event.locationName || event.venue || "",
    addressLine1: event.addressLine1 || "",
    city: event.city || "",
    stateOrProvince: event.stateOrProvince || "",
    postalCode: event.postalCode || "",
    country: event.country || "",
    imageUrl: event.imageUrl || "",
    externalUrl: event.url || "",
    classification: event.classification || "",
    createdBy: event.createdBy || null,
    userId: event.userId || null,
    soloPreviewUsers: event.soloPreviewUsers || [],
    soloAttendeeCount: event.soloAttendeeCount || 0,
  };
}
