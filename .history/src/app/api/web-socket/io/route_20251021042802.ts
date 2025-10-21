import { NextRequest, NextResponse } from "next/server";
import { Server as SocketIOServer } from "socket.io";

// Global variable to store the Socket.IO server instance
let io: SocketIOServer | null = null;

export async function GET(req: NextRequest) {
  if (!io) {
    console.log("✅ Initializing Socket.IO server...");
    
    // @ts-ignore - NextResponse.socket is not in the types but exists
    const resSocket = NextResponse.socket;
    if (!resSocket?.server) {
      return new NextResponse("Socket server not available", { status: 500 });
    }

    io = new SocketIOServer(resSocket.server, {
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
        io!.emit("message", msg);
      });

      socket.on("disconnect", () => {
        console.log("🔴 Client disconnected:", socket.id);
      });
    });
  }

  return new NextResponse("Socket.IO server running", { status: 200 });
}

export const dynamic = "force-static";