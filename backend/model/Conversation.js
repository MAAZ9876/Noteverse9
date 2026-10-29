import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    members: { type: [String], index: true },
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", ConversationSchema);
