// Register + login. Both return { user, token }.
import express from "express";
import bcrypt from "bcryptjs";
import User from "../model/Userschema.js";
import { signToken } from "../middleware/auth.js";
import { asyncHandler, escapeRegex, publicUser } from "../utils/helpers.js";

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,30}$/;
const str = (v) => (typeof v === "string" ? v.trim() : "");

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const username = str(req.body.username);
    const email = str(req.body.email).toLowerCase();
    const password = typeof req.body.password === "string" ? req.body.password : "";
    const firstname = str(req.body.firstname).slice(0, 50);
    const lastname = str(req.body.lastname).slice(0, 50);

    if (!USERNAME_RE.test(username))
      return res.status(400).json({ error: "Username must be 3-30 characters (letters, numbers, _ . -)" });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "Please enter a valid email" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const existing = await User.findOne({
      $or: [{ email }, { username: new RegExp(`^${escapeRegex(username)}$`, "i") }],
    }).select("email");
    if (existing) {
      return res
        .status(409)
        .json({ error: existing.email === email ? "Email is already registered" : "Username is already taken" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed, firstname, lastname });
    res.status(201).json({ user: publicUser(user), token: signToken(user._id) });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const email = str(req.body.email);
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    // case-insensitive exact match (older accounts may have mixed-case emails)
    const user = await User.findOne({ email: new RegExp(`^${escapeRegex(email)}$`, "i") });
    const ok = user ? await bcrypt.compare(password, user.password) : false;
    // same message for both cases so the API doesn't reveal which emails exist
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });

    res.json({ user: publicUser(user), token: signToken(user._id) });
  })
);

export default router;
