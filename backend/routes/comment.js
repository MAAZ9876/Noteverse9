import express from "express";
import Note from "../model/Noteschema.js";
import Comment from "../model/Commentschema.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, isId } from "../utils/helpers.js";

const router = express.Router();

// all comments of a note (:id is the note id)
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    if (!isId(req.params.id)) return res.json([]);
    res.json(await Comment.find({ noteId: req.params.id }).sort({ createdAt: 1 }).lean());
  })
);

// add a comment to a note
router.post(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!isId(req.params.id)) return res.status(404).json({ error: "Note not found" });
    const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
    if (!text) return res.status(400).json({ error: "Comment can't be empty" });
    if (text.length > 500) return res.status(400).json({ error: "Comment is too long (max 500 characters)" });
    if (!(await Note.exists({ _id: req.params.id }))) return res.status(404).json({ error: "Note not found" });

    const comment = await Comment.create({ userId: req.userId, noteId: req.params.id, text });
    res.status(201).json(comment);
  })
);

export default router;
