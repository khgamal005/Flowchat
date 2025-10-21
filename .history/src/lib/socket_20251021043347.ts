// lib/socket.ts
import { io } from "socket.io-client";

export const getSocket = () => {
  const socketUrl = process.env.NODE_ENV === "production" 
    ? "https://yourdomain.com" 
    : "http://localhost:3000";

  console.log("🔌 Creating socket connection to:", socketUrl);
  console.log("🛣️ Socket path:", "/api/web-socket/io");

  const socket = io(socketUrl, {
    withCredentials: true,
    transports: ["websocket", "polling"],
    path: "/api/web-socket/io",
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("✅ Socket.IO: Connected with ID:", socket.id);
    console.log("📡 Socket.IO: Transport:", socket.io.engine.transport.name);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket.IO: Disconnected. Reason:", reason);
    console.log("📡 Socket.IO: Previous ID was:", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.log("💥 Socket.IO: Connection error:", error.message);
    console.log("🔧 Socket.IO: Error details:", error);
  });

  socket.on("reconnect", (attempt) => {
    console.log("🔄 Socket.IO: Reconnected after", attempt, "attempts");
    console.log("🆔 Socket.IO: New ID:", socket.id);
  });

  socket.io.on("reconnect_attempt", (attempt) => {
    console.log("🔄 Socket.IO: Reconnection attempt", attempt);
  });

  socket.io.on("ping", () => {
    console.log("📡 Socket.IO: Ping");
  });

  socket.io.on("pong", () => {
    console.log("📡 Socket.IO: Pong");
  });

  return socket;
};