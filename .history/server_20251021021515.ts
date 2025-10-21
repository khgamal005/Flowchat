// server.ts
import next from "next";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));

  const io = new SocketIOServer(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Unauthorized: No token"));
    }

    try {
      // ✅ Verify Supabase JWT (with your Supabase JWT secret)
      const decoded = jwt.verify(
        token,
        process.env.SUPABASE_JWT_SECRET as string
      ) as any;

      socket.data.user = decoded.sub; // Supabase user id
      next();
    } catch (err) {
      console.error("JWT verification failed:", err);
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 Connected user:", socket.data.user);

    socket.on("message", (msg) => {
      io.emit("message", {
        userId: socket.data.user,
        msg,
      });
    });

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected:", socket.data.user);
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
});
