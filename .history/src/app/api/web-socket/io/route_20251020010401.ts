// app/api/web-socket/io/route.ts
import { NextApiRequest, NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";
import { Server as NetServer } from "http";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure socket and server exist
  const socketServer = res.socket?.server as NetServer | undefined;
  if (!socketServer) {
    console.error("❌ No socket server available");
    return res.status(500).end("Socket server not available");
  }

  // Check if Socket.IO server is already initialized
  if (!(socketServer as any).io) {
    console.log("Initializing Socket.IO server...");

    const io = new IOServer(socketServer, {
      path: "/api/web-socket/io",
      cors: {
        origin: "*", // adjust in production
      },
    });

    io.on("connection", (socket) => {
      console.log("✅ Socket connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("❌ Socket disconnected:", socket.id);
      });

      // Example: listen for a custom event
      socket.on("sendMessage", (data) => {
        console.log("Received message from client:", data);
        // Broadcast to other clients if needed
        socket.broadcast.emit("newMessage", data);
      });
    });

    // Save IO instance on server to avoid re-initialization
    (socketServer as any).io = io;
  }

  res.end("Socket.IO server running");
}
