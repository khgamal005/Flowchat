import next from "next";
import { createServer } from "http";
import { parse } from "url";
import { Server as SocketIOServer } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// initialize Next
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // ✅ attach socket.io to the same HTTP server
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: `http://${hostname}:${port}`,
      credentials: true,
    },
    path: "/api/web-socket/io",
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

  httpServer.listen(port, () => {
    console.log(`🚀 Ready on http://${hostname}:${port}`);
  });
});
