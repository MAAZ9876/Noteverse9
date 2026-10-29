import "dotenv/config";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const IS_PROD = process.env.NODE_ENV === "production";
export const PORT = Number(process.env.PORT) || 8000;

// Accept the old variable name (URL) too, so existing .env files keep working.
export const MONGO_URL = process.env.MONGO_URL || process.env.URL || "mongodb://127.0.0.1:27017/noteverse";

export const CLIENT_ORIGINS = (process.env.CLIENT_ORIGIN || "http://localhost:3000,http://127.0.0.1:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

let secret = process.env.JWT_SECRET;
if (!secret) {
  if (IS_PROD) throw new Error("JWT_SECRET must be set in production");
  secret = crypto.randomBytes(32).toString("hex");
  console.warn("[config] JWT_SECRET is not set - using a temporary one. Everyone is logged out on every restart.");
}
export const JWT_SECRET = secret;

export const PUBLIC_DIR = path.join(__dirname, "public");
export const IMAGES_DIR = path.join(PUBLIC_DIR, "images");
export const UPLOAD_DIR = path.join(PUBLIC_DIR, "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
