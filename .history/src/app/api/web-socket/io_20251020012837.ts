import { NextApiRequest, NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";
import { Server as NetServer } from "http";

// Type fix for res.socket.server.io
export type SockerIoApiResponse = NextApiResponse & {
  socket: {
    server: NetServer & { io?: IOServer };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(
  req: NextApiRequest,
  res: SockerIoApiResponse
) {
  if (!res.socket?.server) {
    return res.status(500).end("No socket server found");
  }

  // Initialize Socket.IO server only once
  if (!res.socket.server.io) {
    console.log("Initializing Socket.IO server...");

    const io = new IOServer(res.socket.server, {
      path: "/api/web-socket/io",
      cors: { origin: "*" }, // adjust in production
      transports: ["websocket"], // force websocket only
    });

    io.on("connection", (socket) => {
      console.log("✅ Socket connected:", socket.id);

      socket.on("disconnect", () =>
        console.log("❌ Socket disconnected:", socket.id)
      );

      // Example: broadcast messages
      socket.on("sendMessage", (data) => {
        console.log("Received:", data);
        socket.broadcast.emit(`newMessage:${data.channelId}`, data);
      });
    });

    res.socket.server.io = io;
  }

  res.end("Socket.IO server running");
}
