import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
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
    req.userId = decoded.userId; 
    next(); 
  } catch (e) {
    return res.status(401).json({ error: "invalid or expired token" });
  }
}