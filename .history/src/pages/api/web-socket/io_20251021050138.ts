// pages/api/web-socket/io.ts
import { Server as SocketIOServer } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";

type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: any;
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (!res.socket.server.io) {
    console.log("✅ Initializing Socket.IO server...");

    const io = new SocketIOServer(res.socket.server, {
      path: "/api/web-socket/io",
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("🟢 Client connected:", socket.id);

      socket.on("message", (data) => {
        console.log("📩 Message received:", data);
        io.emit("message", data);
      });

      socket.on("disconnect", () => {
        console.log("🔴 Client disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
  } else {
    console.log("✅ Socket.IO server already running");
  }

  res.end();
}