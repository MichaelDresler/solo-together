import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function auth(req, res, next) {
  const header = req.headers.authorization; // "Bearer <token>"

  if (!header) {
    return res.status(401).json({ error: "missing Authorization header" });
  }

  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "invalid Authorization format" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "user not found" });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ error: "account is suspended" });
    }

    req.userId = user._id.toString();
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: "invalid or expired token" });
  }
}
