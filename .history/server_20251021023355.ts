// server.ts (Bun-compatible)
import next from "next";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    // Let Next.js handle all routing (including middleware)
    handle(req, res);
  });

  // ⚡ Socket.IO setup
  const io = new SocketIOServer(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.id);
    socket.on("message", (msg) => io.emit("message", msg));
    socket.on("disconnect", () => console.log("🔴 Disconnected:", socket.id));
  });

  httpServer.listen(PORT, () => {
    console.log(`🚀 Bun-compatible server on http://localhost:${PORT}`);
  });
});
