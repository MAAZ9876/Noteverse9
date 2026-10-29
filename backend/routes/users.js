import express from "express";
import bcrypt from "bcryptjs";
import User from "../model/Userschema.js";
import Note from "../model/Noteschema.js";
import Comment from "../model/Commentschema.js";
import { requireAuth } from "../middleware/auth.js";
import {
  asyncHandler,
  escapeRegex,
  isId,
  isSafeUrl,
  publicUser,
  PUBLIC_USER_FIELDS,
  removeUploadedFile,
} from "../utils/helpers.js";

const router = express.Router();

const topAuthors = asyncHandler(async (req, res) => {
  const data = await User.aggregate([
    {
      $project: {
        username: 1,
        profilePicture: 1,
        institution: 1,
        followers_length: { $size: { $ifNull: ["$followers", []] } },
        notes_length: { $size: { $ifNull: ["$notes", []] } },
      },
    },
    { $sort: { notes_length: -1, followers_length: -1 } },
    { $limit: 10 },
  ]);
  res.json(data);
});

// ---- static routes first (they must come before "/:id") ----
router.get("/stats/authors", topAuthors);

router.get(
  "/getauthors",
  asyncHandler(async (req, res) => {
    res.json(await User.find().select(PUBLIC_USER_FIELDS).limit(100).lean());
  })
);

router.get(
  "/findusers/:keyword",
  asyncHandler(async (req, res) => {
    const re = new RegExp(escapeRegex(req.params.keyword), "i");
    const data = await User.find({ $or: [{ username: re }, { firstname: re }, { lastname: re }] })
      .select(PUBLIC_USER_FIELDS)
      .limit(50)
      .lean();
    res.json(data);
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await User.find().select(PUBLIC_USER_FIELDS).limit(200).lean());
  })
);

// ---- single user ----
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    if (!isId(req.params.id)) return res.status(404).json({ error: "User not found" });
    const user = await User.findById(req.params.id).select(PUBLIC_USER_FIELDS).lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  })
);

// update own profile (whitelisted fields only)
router.put(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!isId(req.params.id)) return res.status(404).json({ error: "User not found" });
    if (req.params.id !== req.userId && !req.isAdmin)
      return res.status(403).json({ error: "You can update only your own account" });

    const update = {};
    for (const key of ["firstname", "lastname", "interested", "institution", "desc"]) {
      if (typeof req.body[key] === "string") update[key] = req.body[key].trim();
    }
    if (req.body.profilePicture !== undefined && req.body.profilePicture !== "") {
      if (!isSafeUrl(req.body.profilePicture)) return res.status(400).json({ error: "Invalid profile picture" });
      update.profilePicture = req.body.profilePicture;
    }
    if (req.body.password) {
      if (typeof req.body.password !== "string" || req.body.password.length < 6)
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      update.password = await bcrypt.hash(req.body.password, 10);
    }

    const before = await User.findById(req.params.id).select("profilePicture");
    if (!before) return res.status(404).json({ error: "User not found" });

    const user = await User.findByIdAndUpdate(req.params.id, { $set: update }, { new: true, runValidators: true });
    if (update.profilePicture && before.profilePicture && before.profilePicture !== update.profilePicture) {
      removeUploadedFile(before.profilePicture);
    }
    res.json(publicUser(user));
  })
);

// delete own account (+ everything that belongs to it)
router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!isId(req.params.id)) return res.status(404).json({ error: "User not found" });
    if (req.params.id !== req.userId && !req.isAdmin)
      return res.status(403).json({ error: "You can delete only your own account" });

    const id = req.params.id;
    const notes = await Note.find({ userId: id }).select("notefilename thumbnailfilename");
    notes.forEach((n) => {
      removeUploadedFile(n.notefilename);
      removeUploadedFile(n.thumbnailfilename);
    });
    const noteIds = notes.map((n) => String(n._id));
    await Comment.deleteMany({ $or: [{ userId: id }, { noteId: { $in: noteIds } }] });
    await Note.deleteMany({ userId: id });
    await User.updateMany({ followers: id }, { $pull: { followers: id } });
    await User.updateMany({ followings: id }, { $pull: { followings: id } });
    const user = await User.findByIdAndDelete(id);
    if (user?.profilePicture) removeUploadedFile(user.profilePicture);
    res.json({ message: "Account has been deleted" });
  })
);

router.put(
  "/:id/follow",
  requireAuth,
  asyncHandler(async (req, res) => {
    const targetId = req.params.id;
    if (!isId(targetId)) return res.status(404).json({ error: "User not found" });
    if (targetId === req.userId) return res.status(400).json({ error: "You can't follow yourself" });
    if (!(await User.exists({ _id: targetId }))) return res.status(404).json({ error: "User not found" });

    await User.updateOne({ _id: targetId }, { $addToSet: { followers: req.userId } });
    await User.updateOne({ _id: req.userId }, { $addToSet: { followings: targetId } });
    res.json({ following: true });
  })
);

router.put(
  "/:id/unfollow",
  requireAuth,
  asyncHandler(async (req, res) => {
    const targetId = req.params.id;
    if (!isId(targetId)) return res.status(404).json({ error: "User not found" });
    if (targetId === req.userId) return res.status(400).json({ error: "You can't unfollow yourself" });

    await User.updateOne({ _id: targetId }, { $pull: { followers: req.userId } });
    await User.updateOne({ _id: req.userId }, { $pull: { followings: targetId } });
    res.json({ following: false });
  })
);

export default router;
