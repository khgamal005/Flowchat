import { NextApiResponse } from "next";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";
import { NextRequest } from "next/server";

const ioHandler = (req: NextRequest, res: NextApiResponse) => {
  if (!res.socket.server.io) {
    console.log("🟢 Initializing Socket.IO server...");

    const httpServer: NetServer = res.socket.server as any;

    // Create only once
    const io = new ServerIO(httpServer, {
      path: "/api/web-socket/io",
      addTrailingSlash: false,
      transports: ["websocket", "polling"], // allow both
      cors: {
        origin: process.env.NEXT_PUBLIC_SITE_URL || "*",
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      console.log("✅ Socket connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("❌ Socket disconnected:", socket.id);
      });
    });

    // @ts-ignore
    res.socket.server.io = io;
  } else {
    console.log("⚪ Socket.IO server already running");
  }

  res.end();
};

export const GET = ioHandler;
export const POST = ioHandler;
