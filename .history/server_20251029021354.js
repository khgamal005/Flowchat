import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('❌ Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // 🔥 Initialize Socket.IO
  const io = new Server(server, {
    path: '/api/web-socket/io',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Store globally if needed
  global._io = io;

  // ===============================
  // 📡 MAIN (Default) NAMESPACE
  // ===============================
  io.on('connection', (socket) => {
    console.log('🟢 Client connected to main namespace:', socket.id);

    socket.onAny((event, payload) => {
      console.log(`📡 [MAIN] Received event: ${event}`);

      switch (true) {
        case event.startsWith('channel:'):
          io.emit(event, payload);
          console.log(`🔁 [MAIN] Broadcasted channel event`);
          break;

        case event.startsWith('direct:'):
          io.emit(event, payload);
          console.log(`🔁 [MAIN] Broadcasted direct message event`);
          break;

        default:
          console.log(`⚠️ [MAIN] Unknown event ignored: ${event}`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('🔴 Client disconnected:', socket.id, 'Reason:', reason);
    });
  });

  // ===============================
  // 💬 DIRECT MESSAGES NAMESPACE
  // ===============================
  const directNamespace = io.of('/api/web-socket/direct-messages');

  directNamespace.on('connection', (socket) => {
    console.log('🟢 Client connected to /direct-messages:', socket.id);

    socket.onAny((event, payload) => {
      console.log(`📡 [DM] Received event: ${event}`);

      if (event.startsWith('direct:')) {
        directNamespace.emit(event, payload);
        console.log(`🔁 [DM] Broadcasted direct message event`);
      } else {
        console.log(`⚠️ [DM] Unknown event ignored: ${event}`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('🔴 [DM] Client disconnected:', socket.id, 'Reason:', reason);
    });
  });

  // ===============================
  // 💬 CHANNELS NAMESPACE (Optional)
  // ===============================
  const channelNamespace = io.of('/api/web-socket/channels');

  channelNamespace.on('connection', (socket) => {
    console.log('🟢 Client connected to /channels:', socket.id);

    socket.onAny((event, payload) => {
      console.log(`📡 [CHANNELS] Received event: ${event}`);

      if (event.startsWith('channel:')) {
        channelNamespace.emit(event, payload);
        console.log(`🔁 [CHANNELS] Broadcasted channel event`);
      } else {
        console.log(`⚠️ [CHANNELS] Unknown event ignored: ${event}`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('🔴 [CHANNELS] Client disconnected:', socket.id, 'Reason:', reason);
    });
  });

  // ===============================
  // 🚀 Start server
  // ===============================
  server.listen(port, () => {
    console.log(`> ✅ Ready on http://${hostname}:${port}`);
    console.log(`> 🌐 Socket path: http://${hostname}:${port}/api/web-socket/io`);
    console.log(`> 📨 DM namespace: /api/web-socket/direct-messages`);
    console.log(`> 📨 Channel namespace: /api/web-socket/channels`);
  });
});
