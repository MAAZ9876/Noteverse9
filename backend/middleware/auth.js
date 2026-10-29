import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import User from "../model/Userschema.js";

export const signToken = (userId) => jwt.sign({ id: String(userId) }, JWT_SECRET, { expiresIn: "7d" });

export const verifyToken = (token) => jwt.verify(token, JWT_SECRET);

// Reads "Authorization: Bearer <token>", loads the user and exposes req.userId / req.isAdmin.
export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Please log in" });
    const payload = verifyToken(token);
    const user = await User.findById(payload.id).select("_id isAdmin");
    if (!user) return res.status(401).json({ error: "Account no longer exists" });
    req.userId = String(user._id);
    req.isAdmin = !!user.isAdmin;
    next();
  } catch (err) {
    if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired, please log in again" });
    }
    next(err);
  }
};
