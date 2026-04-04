import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;

  if (!header) {
    next();
    return;
  }

  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
    const user = await User.findById(decoded.userId);

    if (!user || user.status === "suspended") {
      next();
      return;
    }

    req.userId = user._id.toString();
    req.user = user;
  } catch (_error) {
    // Anonymous fallback for optional auth routes.
  }

  next();
}
