// lib/socket.ts
import { io } from "socket.io-client";

export const getSocket = () => {
  const socket = io(
    process.env.NODE_ENV === "production" 
      ? "https://yourdomain.com" 
      : "http://localhost:3000",
    {
      withCredentials: true,
      transports: ["websocket", "polling"],
      path: "/api/web-socket/io",
      autoConnect: true,
    }
  );

  socket.on("connect", () => {
    console.log("✅ Connected with ID:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected");
  });

  socket.on("connect_error", (error) => {
    console.log("❌ Connection error:", error.message);
  });

  return socket;
};