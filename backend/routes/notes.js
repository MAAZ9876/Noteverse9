import express from "express";
import User from "../model/Userschema.js";
import Note from "../model/Noteschema.js";
import Comment from "../model/Commentschema.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, escapeRegex, isId, isSafeUrl, removeUploadedFile } from "../utils/helpers.js";

const router = express.Router();

const clean = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// ---- create ----
router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const notename = clean(req.body.notename, 60);
    const desc = clean(req.body.desc, 500);
    const { notefilename, thumbnailfilename = "" } = req.body;

    if (!notename) return res.status(400).json({ error: "Note name is required" });
    if (!isSafeUrl(notefilename)) return res.status(400).json({ error: "A valid note file is required" });
    if (thumbnailfilename && !isSafeUrl(thumbnailfilename))
      return res.status(400).json({ error: "Invalid thumbnail" });

    // userId always comes from the login token, never from the request body
    const note = await Note.create({ userId: req.userId, notename, desc, notefilename, thumbnailfilename });
    await User.updateOne({ _id: req.userId }, { $addToSet: { notes: String(note._id) } });
    res.status(201).json(note);
  })
);

// ---- lists ----
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const count = Math.min(Math.max(parseInt(req.query.count, 10) || 10, 1), 100);
    // newest first, THEN limit (the old code limited first, so new notes never showed up)
    res.json(await Note.find().sort({ createdAt: -1 }).limit(count).lean());
  })
);

router.get(
  "/findnotes/:keyword",
  asyncHandler(async (req, res) => {
    const re = new RegExp(escapeRegex(req.params.keyword), "i");
    res.json(await Note.find({ $or: [{ desc: re }, { notename: re }] }).sort({ createdAt: -1 }).limit(100).lean());
  })
);

router.get(
  "/profile/:userId",
  asyncHandler(async (req, res) => {
    res.json(await Note.find({ userId: req.params.userId }).sort({ createdAt: -1 }).lean());
  })
);

router.get(
  "/timeline/:userId",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (req.params.userId !== req.userId) return res.status(403).json({ error: "Not allowed" });
    const me = await User.findById(req.userId).select("followings");
    const ids = [req.userId, ...(me?.followings || [])];
    res.json(await Note.find({ userId: { $in: ids } }).sort({ createdAt: -1 }).limit(100).lean());
  })
);

// ---- single note ----
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    if (!isId(req.params.id)) return res.status(404).json({ error: "Note not found" });
    const note = await Note.findById(req.params.id).lean();
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json(note);
  })
);

router.put(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!isId(req.params.id)) return res.status(404).json({ error: "Note not found" });
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: "Note not found" });
    if (note.userId !== req.userId && !req.isAdmin)
      return res.status(403).json({ error: "You can update only your own notes" });

    // Only non-empty values are applied, so a blank form field can never wipe existing data.
    const update = {};
    const notename = clean(req.body.notename, 60);
    const desc = clean(req.body.desc, 500);
    if (notename) update.notename = notename;
    if (desc) update.desc = desc;
    if (req.body.notefilename) {
      if (!isSafeUrl(req.body.notefilename)) return res.status(400).json({ error: "Invalid note file" });
      update.notefilename = req.body.notefilename;
    }
    if (req.body.thumbnailfilename) {
      if (!isSafeUrl(req.body.thumbnailfilename)) return res.status(400).json({ error: "Invalid thumbnail" });
      update.thumbnailfilename = req.body.thumbnailfilename;
    }

    const oldFile = note.notefilename;
    const oldThumb = note.thumbnailfilename;
    const saved = await Note.findByIdAndUpdate(note._id, { $set: update }, { new: true, runValidators: true });
    if (update.notefilename && update.notefilename !== oldFile) removeUploadedFile(oldFile);
    if (update.thumbnailfilename && update.thumbnailfilename !== oldThumb) removeUploadedFile(oldThumb);
    res.json(saved);
  })
);

router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!isId(req.params.id)) return res.status(404).json({ error: "Note not found" });
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: "Note not found" });
    if (note.userId !== req.userId && !req.isAdmin)
      return res.status(403).json({ error: "You can delete only your own notes" });

    await User.updateOne({ _id: note.userId }, { $pull: { notes: String(note._id) } });
    await Comment.deleteMany({ noteId: String(note._id) });
    await note.deleteOne();
    removeUploadedFile(note.notefilename);
    removeUploadedFile(note.thumbnailfilename);
    res.json({ message: "The note has been deleted" });
  })
);

// ---- reactions ----
router.put(
  "/:id/like",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!isId(req.params.id)) return res.status(404).json({ error: "Note not found" });
    const note = await Note.findById(req.params.id).select("likes");
    if (!note) return res.status(404).json({ error: "Note not found" });

    const liked = !note.likes.includes(req.userId);
    const updated = await Note.findByIdAndUpdate(
      note._id,
      liked ? { $addToSet: { likes: req.userId } } : { $pull: { likes: req.userId } },
      { new: true }
    ).select("likes");
    res.json({ liked, likes: updated.likes.length });
  })
);

// records that a user opened the note ("buy" is the legacy name for this, "view" is the new one)
const markViewed = asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) return res.status(404).json({ error: "Note not found" });
  const updated = await Note.findByIdAndUpdate(req.params.id, { $addToSet: { buy: req.userId } }, { new: true }).select(
    "buy"
  );
  if (!updated) return res.status(404).json({ error: "Note not found" });
  res.json({ views: updated.buy.length });
});
router.put("/:id/view", requireAuth, markViewed);
router.put("/:id/buy", requireAuth, markViewed);

export default router;
