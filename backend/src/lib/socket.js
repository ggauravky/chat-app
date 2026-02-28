import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? true
        : ["http://localhost:5173"],
    credentials: true,
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// {userId: socketId}
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Notify everyone that this user just came online
  if (userId) {
    socket.broadcast.emit("userOnline", { userId });
  }

  // --------------- Typing indicators ---------------
  socket.on("typing", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", { senderId: userId });
    }
  });

  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userStopTyping", { senderId: userId });
    }
  });

  // --------------- Read receipts ---------------
  // Fired by receiver when they open a conversation
  socket.on("markRead", ({ senderId }) => {
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      // Tell the original sender their messages have been read
      io.to(senderSocketId).emit("messagesRead", { readBy: userId });
    }
  });

  // --------------- Message status: delivered ---------------
  // When a user connects, mark unread messages sent to them as "delivered"
  socket.on("messageDelivered", ({ messageIds, senderId }) => {
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesDelivered", { messageIds });
    }
  });

  // --------------- Disconnect ---------------
  socket.on("disconnect", async () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Notify everyone this user went offline
    if (userId) {
      socket.broadcast.emit("userOffline", { userId });
    }

    // Update lastSeen on disconnect
    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
      } catch (err) {
        console.error("Failed to update lastSeen:", err.message);
      }
    }
  });
});

export { io, app, server };

