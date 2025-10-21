import { NextRequest } from "next/server";
import { Server as SocketIOServer } from "socket.io";

const io = globalThis.io || new SocketIOServer({
  path: "/api/web-socket/io",
});

if (!globalThis.io) {
  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);
    socket.on("disconnect", () => console.log("❌ Socket disconnected:", socket.id));
  });
  globalThis.io = io;
}

export async function GET(_req: NextRequest) {
  return new Response("Socket.IO server running", { status: 200 });
}
