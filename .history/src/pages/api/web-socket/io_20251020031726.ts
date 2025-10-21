import { NextApiRequest, NextApiResponse } from "next";
import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";

export const config = {
  api: { bodyParser: false },
};

// Extend Next.js types to include Socket.IO server
export type SockerIoApiResponse = NextApiResponse & {
  socket: NextApiResponse["socket"] & {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

const initializeSocketServer = (httpServer: NetServer): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    path: "/api/web-socket/io",
    addTrailingSlash: false,
    cors: {
      origin: process.env.NODE_ENV === "production" 
        ? ["https://your-production-domain.com"] 
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
      methods: ["GET", "POST"],
      credentials: true
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    // Handle custom events here
    socket.on("ping", (data) => {
      socket.emit("pong", { ...data, serverTime: Date.now() });
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", socket.id, "Reason:", reason);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", socket.id, error);
    });
  });

  return io;
};

export default function handler(req: NextApiRequest, res: SockerIoApiResponse) {
  // Ensure this only runs once
  if (!res.socket.server.io) {
    console.log("🚀 Initializing new Socket.IO server...");
    res.socket.server.io = initializeSocketServer(res.socket.server);
  } else {
    console.log("✅ Socket.IO server already initialized");
  }

  res.end();
}