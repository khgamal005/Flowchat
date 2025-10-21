import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // your frontend URL
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

httpServer.listen(3001, () => {
  console.log("🚀 Socket.IO server running at http://localhost:3001");
});
