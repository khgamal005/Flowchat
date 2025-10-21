// server.ts
import next from "next";
import { createServer } from "http";
import { parse } from "url";
import { Server } from "socket.io";
import { NextRequest, NextResponse } from "next/server";
import { runMiddleware } from "./src/middleware";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = 3000;

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    // Skip WebSocket routes
    if (req.url?.startsWith("/socket.io")) {
      return handle(req, res);
    }

    // 🔐 Run Supabase middleware manually
    const request = new NextRequest(`http://${req.headers.host}${req.url}`, {
      headers: req.headers as HeadersInit,
    });
    const response = NextResponse.next();
    await runMiddleware(request, response);

    // Continue to Next.js
    handle(req, res);
  });

  // ⚡ Socket.IO setup
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.id);
    socket.on("disconnect", () => console.log("🔴 Disconnected:", socket.id));
  });

  httpServer.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
});
