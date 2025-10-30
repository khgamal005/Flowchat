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
    path: '/socket.io',
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  // ===============================
  // 📡 MAIN (for misc)
  // ===============================
  io.on('connection', (socket) => {
    console.log('🟢 Main connection:', socket.id);

    socket.onAny((event, payload) => {
      console.log(`[MAIN] Event: ${event}`);
      io.emit(event, payload);
    });
  });

  // ===============================
  // 💬 DIRECT MESSAGES
  // ===============================
  const directNamespace = io.of('/direct-messages');
  directNamespace.on('connection', (socket) => {
    console.log('🟢 Connected to /direct-messages:', socket.id);

    socket.onAny((event, payload) => {
      console.log(`[DM] Event: ${event}`);
      if (event.startsWith('direct:')) {
        directNamespace.emit(event, payload);
        console.log('🔁 [DM] Broadcasted');
      }
    });
  });

  // ===============================
  // 💬 CHANNELS
  // ===============================
  const channelNamespace = io.of('/channels');
  channelNamespace.on('connection', (socket) => {
    console.log('🟢 Connected to /channels:', socket.id);

    socket.onAny((event, payload) => {
      console.log(`[CHANNEL] Event: ${event}`);
      if (event.startsWith('channel:')) {
        channelNamespace.emit(event, payload);
        console.log('🔁 [CHANNEL] Broadcasted');
      }
    });
  });

  // 🚀 Start
  server.listen(port, () => {
    console.log(`✅ Ready on http://${hostname}:${port}`);
    console.log(`🗣️ Direct messages: /direct-messages`);
    console.log(`🗣️ Channels: /channels`);
  });
});
