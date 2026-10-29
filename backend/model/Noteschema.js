import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    price: { type: Number, default: 0 },
    notename: { type: String, required: true, trim: true, maxlength: 60 },
    desc: { type: String, trim: true, maxlength: 500, default: "" },
    thumbnailfilename: { type: String, default: "" },
    notefilename: { type: String, required: true },
    likes: { type: [String], default: [] },
    // "buy" is historical naming: it stores the ids of users who viewed the note.
    buy: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Note", NoteSchema);
