import { NextRequest, NextResponse } from "next/server";
import { Server as SocketIOServer } from "socket.io";

const ioMap = globalThis as unknown as {
  io?: SocketIOServer;
};

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!ioMap.io) {
    console.log("✅ Initializing Socket.IO server...");

    const io = new SocketIOServer({
      path: "/api/web-socket/io",
      cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
      console.log("🟢 Client connected:", socket.id);

      socket.on("message", (msg) => {
        console.log("📩", msg);
        io.emit("message", msg);
      });

      socket.on("disconnect", () => {
        console.log("🔴 Client disconnected:", socket.id);
      });
    });

    ioMap.io = io;
  }

  return NextResponse.json({ ok: true });
}
