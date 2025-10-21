// /pages/api/socket.js
import { Server } from "socket.io";

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log("✅ Initializing new Socket.IO server...");
    const io = new Server(res.socket.server, {
      path: "/api/socket_io",
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => {
      console.log("🟢 Client connected:", socket.id);

      socket.on("message", (msg) => {
        console.log("📩 Received:", msg);
        io.emit("message", msg); // broadcast
      });

      socket.on("disconnect", () => {
        console.log("🔴 Client disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}
