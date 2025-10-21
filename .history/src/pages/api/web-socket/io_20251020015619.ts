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
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  return io;
};

export default function handler(req: NextApiRequest, res: SockerIoApiResponse) {
  if (!res.socket.server.io) {
    console.log("🚀 Initializing new Socket.IO server...");
    res.socket.server.io = initializeSocketServer(res.socket.server);
  }

  res.end();
}
