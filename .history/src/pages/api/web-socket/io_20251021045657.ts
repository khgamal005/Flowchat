// pages/api/web-socket/io.ts
import { Server as NetServer } from "http";
import { NextApiRequest, NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";

interface SocketServer extends HTTPServer {
  io?: SocketIOServer;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function ioHandler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (!res.socket.server.io) {
    console.log("✅ Initializing Socket.IO server...");

    const io = new SocketIOServer(res.socket.server, {
      path: "/api/web-socket/io",
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === "production" 
          ? "https://yourdomain.com" 
          : "http://localhost:3000",
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      console.log("🟢 Client connected:", socket.id);

      socket.on("message", (msg) => {
        console.log("📩 Received message:", msg);
        io.emit("message", msg); // Broadcast to all clients
      });

      socket.on("disconnect", (reason) => {
        console.log("🔴 Client disconnected:", socket.id, "Reason:", reason);
      });
    });

    res.socket.server.io = io;
  } else {
    console.log("✅ Socket.IO server already running");
  }

  res.end();
}