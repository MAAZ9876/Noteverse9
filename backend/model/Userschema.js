import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    firstname: { type: String, trim: true, maxlength: 50 },
    lastname: { type: String, trim: true, maxlength: 50 },
    interested: { type: String, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: "" },
    desc: { type: String, trim: true, maxlength: 300, default: "" },
    followers: { type: [String], default: [] },
    followings: { type: [String], default: [] },
    isAdmin: { type: Boolean, default: false },
    institution: { type: String, trim: true, maxlength: 80 },
    notes: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
