import express from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { UPLOAD_DIR } from "../config.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const ALLOWED = new Set([".pdf", ".doc", ".docx", ".ppt", ".pptx", ".txt", ".png", ".jpg", ".jpeg", ".gif", ".webp"]);
const MAX_MB = 25;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_MB * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED.has(ext)) return cb(null, true);
    cb(new Error("UNSUPPORTED_TYPE"));
  },
});

// POST /api/upload   (multipart/form-data, field name "file", login required)
// Returns a relative url like "/uploads/123-abc.pdf" - the frontend prefixes the API address.
router.post("/", requireAuth, (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      const error =
        err.message === "UNSUPPORTED_TYPE"
          ? "Unsupported file type (allowed: pdf, doc, docx, ppt, pptx, txt, png, jpg, jpeg, gif, webp)"
          : err.code === "LIMIT_FILE_SIZE"
          ? `File is too large (max ${MAX_MB} MB)`
          : "Upload failed";
      return res.status(400).json({ error });
    }
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});

export default router;
