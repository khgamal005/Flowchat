import { io } from "socket.io-client";

export const getSocket = () => {
  const socket = io("http://localhost:3000", {
    withCredentials: true,
    transports: ["websocket"],
    path: "/api/web-socket/io",
  });

  socket.on("connect", () => {
    console.log("✅ Connected with ID:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected");
  });

  return socket;
};
