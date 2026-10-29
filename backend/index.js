import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";

import {
  PORT,
  MONGO_URL,
  CLIENT_ORIGINS,
  IMAGES_DIR,
  UPLOAD_DIR,
} from "./config.js";

import connection from "./database/db.js";
import { initSocket } from "./socket.js";

import userRoute from "./routes/users.js";
import authRoute from "./routes/auth.js";
import noteRoute from "./routes/notes.js";
import commentRoute from "./routes/comment.js";
import conversationRoute from "./routes/conversation.js";
import messageRoute from "./routes/message.js";
import uploadRoute from "./routes/upload.js";

// NEW: Gemini AI route
import aiRoute from "./routes/ai.js";

const app = express();

app.disable("x-powered-by");

app.use(
  cors({
    origin: CLIENT_ORIGINS,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Allow frontend access to images and PDF uploads.
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));

app.use(
  "/images",
  express.static(IMAGES_DIR, {
    index: false,
    dotfiles: "deny",
  })
);

app.use(
  "/uploads",
  express.static(UPLOAD_DIR, {
    index: false,
    dotfiles: "deny",
    setHeaders: (res) => {
      // Allow the browser's built-in PDF viewer.
      res.removeHeader("Content-Security-Policy");
    },
  })
);

// Health checks
app.get("/", (req, res) => {
  res.send("NoteVerse API is running");
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    db: mongoose.connection.readyState === 1,
  });
});

// Existing application routes
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/notes", noteRoute);
app.use("/api/comments", commentRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);
app.use("/api/upload", uploadRoute);

// NEW: Gemini AI endpoint
app.use("/api/ai", aiRoute);

// Handle unknown API endpoints
app.use("/api", (req, res) => {
  res.status(404).json({
    error: "Not found",
  });
});

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Invalid JSON",
    });
  }

  if (err?.name === "CastError") {
    return res.status(400).json({
      error: "Invalid id",
    });
  }

  if (err?.name === "ValidationError") {
    return res.status(400).json({
      error: Object.values(err.errors)
        .map((e) => e.message)
        .join(", "),
    });
  }

  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "value";

    return res.status(409).json({
      error: `That ${field} is already taken`,
    });
  }

  console.error(err);

  res.status(500).json({
    error: "Something went wrong on the server",
  });
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

// HTTP server and chat sockets
const server = http.createServer(app);

initSocket(server, CLIENT_ORIGINS);

// Connect to MongoDB before starting the server.
try {
  await connection(MONGO_URL);
} catch (err) {
  console.error("\nCould not connect to MongoDB:", err.message);

  console.error(
    "Start MongoDB (e.g. `docker compose up -d` in the project root) " +
      "or set MONGO_URL in backend/.env\n"
  );

  process.exit(1);
}

server.listen(PORT, () => {
  console.log(
    `NoteVerse API + chat listening on http://localhost:${PORT}`
  );
});