import { NextApiRequest, NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";
import { Server as NetServer } from "http";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!res.socket.server.io) {
    console.log("Initializing Socket.IO server...");
    const io = new IOServer(res.socket.server as unknown as NetServer, {
      path: "/api/web-socket/io",
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => {
      console.log("✅ Socket connected:", socket.id);
      socket.on("disconnect", () => console.log("❌ Socket disconnected:", socket.id));
    });

    res.socket.server.io = io; // attach to the server
  }

  res.end();
}
