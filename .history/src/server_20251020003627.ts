import { createServer } from "http";
import { Server as IOServer } from "socket.io";

const httpServer = createServer();
const io = new IOServer(httpServer, {
  path: "/api/web-socket/io",
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);
  socket.on("disconnect", () => console.log("❌ Socket disconnected:", socket.id));
});

httpServer.listen(300, () => {
  console.log("Socket.IO server running on port 3001");
});
