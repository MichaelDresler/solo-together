export function serializeUserProfile(user) {
  return {
    _id: user._id,
    id: user._id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl || "",
  };
}
