import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    noteId: { type: String, required: true, index: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
    likes: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Comment", CommentSchema);
