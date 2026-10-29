import express from "express";
import Message from "../model/Message.js";
import Conversation from "../model/Conversation.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, isId } from "../utils/helpers.js";

const router = express.Router();

const getMyConversation = async (conversationId, userId) => {
  if (!isId(conversationId)) return null;
  return Conversation.findOne({ _id: conversationId, members: userId });
};

// send a message (sender is taken from the login token)
router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { conversationId } = req.body;
    const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
    if (!text) return res.status(400).json({ error: "Message can't be empty" });
    if (text.length > 2000) return res.status(400).json({ error: "Message is too long" });

    const conversation = await getMyConversation(conversationId, req.userId);
    if (!conversation) return res.status(403).json({ error: "You are not part of this conversation" });

    const message = await Message.create({ conversationId, sender: req.userId, text });
    await Conversation.updateOne({ _id: conversation._id }, { $currentDate: { updatedAt: true } });
    res.status(201).json(message);
  })
);

// messages of one conversation (only members may read)
router.get(
  "/:conversationId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const conversation = await getMyConversation(req.params.conversationId, req.userId);
    if (!conversation) return res.status(403).json({ error: "You are not part of this conversation" });
    res.json(await Message.find({ conversationId: req.params.conversationId }).sort({ createdAt: 1 }).lean());
  })
);

export default router;
