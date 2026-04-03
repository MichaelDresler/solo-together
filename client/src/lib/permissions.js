export function isAdmin(user) {
  return ["admin", "super_admin"].includes(user?.role);
}

export function isSuperAdmin(user) {
  return user?.role === "super_admin";
}

export function canManageMembers(user) {
  return isAdmin(user);
}

export function canAssignAdmins(user) {
  return isSuperAdmin(user);
}

export function getEventOwnerId(event) {
  return (
    event?.createdBy?._id ||
    event?.userId?._id ||
    event?.createdBy ||
    event?.userId ||
    null
  );
}

export function canManageEvent(user, event) {
  if (!user || !event) {
    return false;
  }

  if (isAdmin(user)) {
    return true;
  }

  return getEventOwnerId(event) === (user._id || user.id);
}
