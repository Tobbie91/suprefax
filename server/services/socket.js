import { Server } from "socket.io";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      socket.join(userId);
    });

    socket.on("joinRoom", ({ roomId }) => {
      socket.join(roomId);
    });

    socket.on("sendMessage", ({ roomId, senderId, text }) => {
      io.to(roomId).emit("message", { senderId, text });
    });

    socket.on("message", ({ to, message }) => {
      io.to(to).emit("message", message);
    });

    socket.on("disconnect", () => {});
  });

  return io;
};
