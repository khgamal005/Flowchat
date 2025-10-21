import { Server } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: { bodyParser: false },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponse) => {
  if (!(res.socket as any).server.io) {
    console.log("✅ Initializing Socket.IO server...");
    const io = new Server((res.socket as any).server, {
      path: "/api/web-socket/io",
      cors: {
        origin: "http://localhost:3000",
        credentials: true,
      },
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

    (res.socket as any).server.io = io;
  }

  res.end();
};

export default ioHandler;
