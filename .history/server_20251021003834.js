import next from "next";
import { createServer } from "http";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = 3000;

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res); // let Next.js handle all HTTP routes
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);

    socket.on("message", (msg) => {
      console.log("📩", msg);
      io.emit("message", msg);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected:", socket.id);
    });
  });

  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`🚀 Ready on http://localhost:${PORT}`);
  });
});
