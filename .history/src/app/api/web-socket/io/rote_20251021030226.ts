// /src/app/api/socket/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Server } from "socket.io";

export const runtime = "nodejs";

let io: any;

export async function GET(req: NextRequest) {
  if (!io) {
    const server = (globalThis as any).serverSocket ??= {};
    if (!server.io) {
      console.log("✅ Initializing Socket.IO server...");
      server.io = new Server(3001, {
        cors: { origin: "*" },
      });

      server.io.on("connection", (socket) => {
        console.log("🟢 Client connected:", socket.id);

        socket.on("message", (msg) => {
          console.log("📩", msg);
          server.io.emit("message", msg);
        });

        socket.on("disconnect", () => {
          console.log("🔴 Client disconnected:", socket.id);
        });
      });

      (globalThis as any).serverSocket = server;
    }
    io = (globalThis as any).serverSocket.io;
  }

  return NextResponse.json({ status: "ok" });
}
