import { getAvatarUrl, getUserInitials } from "../utils/avatar";

export default function UserAvatar({
  user,
  size = 48,
  className = "",
  textClassName = "",

}) {
  const avatarUrl = getAvatarUrl(user, size);
  const initials = getUserInitials(user);

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${user?.username || "User"} avatar`}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size,  }}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-stone-900 text-white ${className}`}
      style={{ width: size, height: size }}
    >
      <span className={`font-semibold ${textClassName}`}>{initials}</span>
    </div>
  );
}
