// server.ts
import next from "next";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { Server as SocketIOServer } from "socket.io";
import { NextRequest, NextResponse } from "next/server";
import { mi } from "./src/middleware"; // Make sure this exports a valid middleware runner

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    // 🧩 Skip middleware for WebSocket/Socket.IO routes
    if (req.url?.startsWith("/socket.io")) {
      handle(req, res);
      return;
    }

    // 🧠 Create a mock NextRequest so we can reuse middleware logic
    const request = new NextRequest(`http://${req.headers.host}${req.url ?? ""}`, {
      headers: new Headers(req.headers as Record<string, string>),
    });

    let response = NextResponse.next();

    try {
      response = await runMiddleware(request, response);
    } catch (err) {
      console.error("Middleware error:", err);
    }

    // Continue to Next.js request handler
    handle(req, res);
  });

  // ⚡ Setup Socket.IO
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*", // 🔒 Replace with your frontend domain in production
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    socket.on("message", (msg) => {
      console.log("📩 Message:", msg);
      io.emit("message", msg); // Broadcast to all clients
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
