// Realtime chat. Runs inside the API server (same port), so no separate socket server is needed.
import { Server } from "socket.io";
import { verifyToken } from "./middleware/auth.js";
import Conversation from "./model/Conversation.js";
import { isId } from "./utils/helpers.js";

const online = new Map(); // userId -> Set of socket ids (one user can have several tabs open)

const onlineUserIds = () => [...online.keys()];

export function initSocket(server, origins) {
  const io = new Server(server, { cors: { origin: origins, methods: ["GET", "POST"] } });

  // Every socket must present a valid login token; the user id comes from it, not from the client.
  io.use((socket, next) => {
    try {
      const payload = verifyToken(socket.handshake.auth?.token);
      socket.userId = String(payload.id);
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const uid = socket.userId;
    if (!online.has(uid)) online.set(uid, new Set());
    online.get(uid).add(socket.id);
    io.emit("getUsers", onlineUserIds());

    socket.on("addUser", () => socket.emit("getUsers", onlineUserIds()));

    socket.on("sendMessage", async ({ receiverId, conversationId, text } = {}) => {
      try {
        if (typeof text !== "string" || !text.trim() || !isId(receiverId) || !isId(conversationId)) return;
        const targets = online.get(receiverId);
        if (!targets || targets.size === 0) return; // receiver offline: message is already saved by the REST API

        // only deliver inside a real conversation that contains both people
        const ok = await Conversation.exists({ _id: conversationId, members: { $all: [uid, receiverId] } });
        if (!ok) return;

        for (const id of targets) {
          io.to(id).emit("getMessage", {
            senderId: uid,
            conversationId,
            text: text.trim().slice(0, 2000),
            createdAt: Date.now(),
          });
        }
      } catch (err) {
        console.error("sendMessage failed:", err.message);
      }
    });

    socket.on("disconnect", () => {
      const set = online.get(uid);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) online.delete(uid);
      }
      io.emit("getUsers", onlineUserIds());
    });
  });

  return io;
}
