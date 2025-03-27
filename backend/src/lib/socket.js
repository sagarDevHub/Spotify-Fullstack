import { Server } from "socket.io";
import { Message } from "../models/message.model.js";

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  const userSockets = new Map(); // { userId: socketId }
  const userActivities = new Map(); // { userId: activity }

  io.on("connection", (socket) => {
    socket.on("user_connected", (userId) => {
      if (!userId) return;

      userSockets.set(userId, socket.id);
      userActivities.set(userId, "Online");

      // Broadcast to all clients
      io.emit("user_connected", userId);
      io.emit("users_online", Array.from(userSockets.keys()));
      io.emit("activities", Array.from(userActivities.entries()));
    });

    socket.on("update_activity", ({ userId, activity }) => {
      if (!userId || !activity) return;
      userActivities.set(userId, activity);
      io.emit("activity_updated", { userId, activity });
    });

    socket.on("send_message", async (data) => {
      try {
        const { senderId, receiverId, content } = data;
        if (!senderId || !receiverId || !content.trim()) {
          throw new Error("Invalid message data.");
        }

        const message = await Message.create({
          senderId,
          receiverId,
          content,
        });

        // Send to receiver if online
        const receiverSocketId = userSockets.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receiver_message", message);
        }
        socket.emit("message_sent", message);
      } catch (error) {
        console.error("Message error:", error);
        socket.emit("message_error", error.message);
      }
    });

    socket.on("disconnect", () => {
      let disconnectedUserId = null;

      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          userSockets.delete(userId);
          userActivities.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        io.emit("user_disconnected", disconnectedUserId);
        io.emit("users_online", Array.from(userSockets.keys()));
      }
    });
  });
};
