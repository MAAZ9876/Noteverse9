import mongoose from "mongoose";

const connection = async (url) => {
  if (!url) throw new Error("MONGO_URL is not set (see backend/.env.example)");
  mongoose.set("strictQuery", true);
  await mongoose.connect(url, { serverSelectionTimeoutMS: 8000 });
  console.log("MongoDB connected");
};

export default connection;
