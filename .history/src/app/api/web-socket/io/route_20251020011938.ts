import { NextApiRequest, NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";
import { Server as NetServer } from "http";

// Custom type to fix TS error
export type SockerIoApiResponse = NextApiResponse & {
  socket: {
    server: NetServer & { io?: IOServer };
  };
};

export const config = {
  api: { bodyParser: false },
};

export default function handler(
  req: NextApiRequest,
  res: SockerIoApiResponse
) {
  const server = res.socket?.server;
  if (!server) return res.status(500).end("Socket server not available");

  if (!server.io) {
    console.log("Initializing Socket.IO server...");

    const io = new IOServer(server, {
      path: "/api/web-socket/io",
      cors: { origin: "*" }, // adjust in production
    });

    io.on("connection", (socket) => {
      console.log("✅ Socket connected:", socket.id);

      socket.on("disconnect", () =>
        console.log("❌ Socket disconnected:", socket.id)
      );

      socket.on("sendMessage", (data) => {
        console.log("Received message:", data);
        // Broadcast to other clients in the same channel/workspace
        socket.broadcast.emit("newMessage", data);
      });
    });

    server.io = io;
  }

  res.end("Socket.IO server running");
}
