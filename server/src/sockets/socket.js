import  Server  from "socket.io";
import env from "../config/env.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // User joins their own room
    socket.on("join", (userId) => {
      socket.join(userId);

      console.log(`User ${userId} joined room`);
    });

    // Send private message
    socket.on("sendMessage", (data) => {
      const { receiverId, message } = data;

      io.to(receiverId).emit("newMessage", {
        message,
      });
    });

    // User disconnects
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  console.log("Socket.IO initialized");

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};