import next from "next";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
// 🧠 FIX: import explicitly from "next/server.js" instead of "next/server"
import { NextRequest, NextResponse } from "next/server.js";
import { runMiddleware } from "./src/middleware.js";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    if (req.url?.startsWith("/socket.io")) {
      handle(req, res);
      return;
    }

    const request = new NextRequest(`http://${req.headers.host}${req.url ?? ""}`, {
      headers: new Headers(req.headers),
    });

    let response = NextResponse.next();

    try {
      response = await runMiddleware(request, response);
    } catch (err) {
      console.error("⚠️ Middleware error:", err);
    }

    handle(req, res);
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    socket.on("message", (msg) => {
      console.log("📩 Message:", msg);
      io.emit("message", msg);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
