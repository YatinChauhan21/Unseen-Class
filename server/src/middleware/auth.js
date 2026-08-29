import jwt from "jsonwebtoken";

export function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return res.status(401).json({ message: "Admin authentication required" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "admin") return res.status(403).json({ message: "Forbidden" });

    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired admin token" });
  }
}
