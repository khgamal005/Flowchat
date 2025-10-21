import { NextRequest, NextResponse } from "next/server";
import { Server as IOServer } from "socket.io";
import { Server as NetServer } from "http";

export const GET = async (_req: NextRequest) => {
  const server = (_req as any).socket?.server as NetServer;

  if (!server) {
    return NextResponse.json({ error: "No server available" }, { status: 500 });
  }

  if (!(server as any).io) {
    const io = new IOServer(server, {
      path: "/api/web-socket/io",
      cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
      console.log("✅ Socket connected:", socket.id);
      socket.on("disconnect", () => console.log("❌ Socket disconnected:", socket.id));
    });

    (server as any).io = io;
    console.log("Socket.IO initialized");
  }

  return NextResponse.json({ status: "Socket.IO running" });
};
