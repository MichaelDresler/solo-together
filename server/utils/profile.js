export function serializeUserProfile(user) {
  return {
    _id: user._id,
    id: user._id,
    email: user.email || "",
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl || "",
    role: user.role || "member",
    status: user.status || "active",
  };
}
