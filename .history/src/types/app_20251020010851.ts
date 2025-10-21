// app/api/web-socket/io/route.ts
import { NextApiRequest, NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import { Server as NetServer } from "http";

// Custom type for res.socket.server.io
export type SockerIoApiResponse = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: SockerIoApiResponse) {
  const server = res.socket?.server;
  if (!server) {
    console.error("❌ No socket server available");
    return res.status(500).end("Socket server not available");
  }

  // Initialize Socket.IO only once
  if (!server.io) {
    console.log("Initializing Socket.IO server...");

    const io = new SocketIOServer(server, {
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

      // Example event
      socket.on("sendMessage", (data) => {
        console.log("Received message:", data);
        socket.broadcast.emit("newMessage", data);
      });
    });

    // Save IO instance to server
    server.io = io;
  }

  res.end("Socket.IO server running");
}
