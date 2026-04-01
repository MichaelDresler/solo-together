function injectCloudinaryTransformations(url, transformations) {
  if (!url || !url.includes("/upload/")) {
    return url || "";
  }

  return url.replace("/upload/", `/upload/${transformations}/`);
}

export function getAvatarUrl(user, size = 128) {
  const avatarUrl = user?.avatarUrl || "";

  if (!avatarUrl) {
    return "";
  }

  return injectCloudinaryTransformations(
    avatarUrl,
    `c_fill,h_${size},w_${size},f_auto,q_auto`
  );
}

export function getUserInitials(user) {
  const fullName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (fullName) {
    return fullName
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
  }

  return user?.username?.slice(0, 2)?.toUpperCase() || "?";
}

export function getUserDisplayName(user) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  return fullName || user?.username || "Unknown user";
}
