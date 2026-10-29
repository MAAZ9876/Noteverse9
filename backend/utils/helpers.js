import fs from "fs";
import path from "path";
import { UPLOAD_DIR } from "../config.js";

export const isId = (v) => typeof v === "string" && /^[a-f\d]{24}$/i.test(v);

export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Only allow links that point at our own uploads or an http(s) URL.
// Blocks "javascript:" / "data:" URLs being saved and later opened by other users.
export const isSafeUrl = (v) =>
  typeof v === "string" && v.length <= 500 && /^(\/uploads\/[\w.\-]+|https?:\/\/[^\s]+)$/i.test(v);

export const publicUser = (u) => {
  const o = typeof u.toObject === "function" ? u.toObject() : { ...u };
  delete o.password;
  delete o.__v;
  return o;
};

// Fields that are safe to show to other people.
export const PUBLIC_USER_FIELDS = "-password -email -isAdmin -__v";

export const removeUploadedFile = (ref) => {
  if (!ref || typeof ref !== "string") return;
  const m = ref.match(/\/uploads\/([^/?#]+)$/);
  if (!m) return;
  fs.unlink(path.join(UPLOAD_DIR, path.basename(m[1])), () => {});
};

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
