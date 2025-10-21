if (!res.socket || !(res.socket as any).server) {
  return res.status(500).end("No server available");
}

const server = res.socket.server as unknown as NetServer;

if (!(res.socket as any).server.io) {
  const io = new IOServer(server, {
    path: "/api/web-socket/io",
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);
    socket.on("disconnect", () => console.log("❌ Socket disconnected:", socket.id));
  });

  (res.socket as any).server.io = io;
}

res.end();

}
