import express from "express";
import Conversation from "../model/Conversation.js";
import User from "../model/Userschema.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, isId } from "../utils/helpers.js";

const router = express.Router();

// find-or-create the 1:1 conversation between me and receiverId. Always returns ONE object.
router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { receiverId } = req.body;
    if (!isId(receiverId)) return res.status(400).json({ error: "receiverId is required" });
    if (receiverId === req.userId) return res.status(400).json({ error: "You can not chat with yourself" });
    if (!(await User.exists({ _id: receiverId }))) return res.status(404).json({ error: "User not found" });

    let conversation = await Conversation.findOne({ members: { $all: [req.userId, receiverId] } });
    if (!conversation) conversation = await Conversation.create({ members: [req.userId, receiverId] });
    res.json(conversation);
  })
);

// conversation between me and another user (null if none yet)
router.get(
  "/find/:firstUserId/:secondUserId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { firstUserId, secondUserId } = req.params;
    if (![firstUserId, secondUserId].includes(req.userId)) return res.status(403).json({ error: "Not allowed" });
    res.json(await Conversation.findOne({ members: { $all: [firstUserId, secondUserId] } }));
  })
);

// all my conversations, most recent first
router.get(
  "/:userId",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (req.params.userId !== req.userId) return res.status(403).json({ error: "Not allowed" });
    res.json(await Conversation.find({ members: req.userId }).sort({ updatedAt: -1 }).lean());
  })
);

export default router;
