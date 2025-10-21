import next from "next";
import { createServer } from "http";
import { parse } from "url";
import { runMiddleware } from "./middleware"; // 👈 import our custom function
import { NextRequest } from "next/server";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = 3000;

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    // Skip WebSocket paths
    if (req.url?.startsWith("/socket.io")) {
      return handle(req, res);
    }

    // 🧠 Run middleware manually
    const parsedUrl = parse(req.url!, true);
    const request = new NextRequest(`http://${req.headers.host}${req.url}`, {
      headers: req.headers as HeadersInit,
    });

    await runMiddleware(request); // run Supabase cookie/session logic

    // Continue to Next.js
    handle(req, res, parsedUrl);
  });

  // ⚡ Setup Socket.IO
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);
  });

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready on http://localhost:${PORT}`);
  });
});
