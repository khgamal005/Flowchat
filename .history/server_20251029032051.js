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

  const io = new Server(server, {
    path: '/api/web-socket/io',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // 🔥 Make io globally accessible if needed
  global._io = io;

  io.on('connection', (socket) => {
    console.log('🟢 Client connected:', socket.id);

    // 💬 Listen to *all* emitted events dynamically
const messageNamespace = io.of('/api/web-socket/messages');
const directMessageNamespace = io.of('/api/web-socket/direct-messages');

// Generic handler for both namespaces
function handleSocketEvents(namespace, type) {
  namespace.on('connection', (socket) => {
    console.log(`🟢 Client connected to ${type}:`, socket.id);

    socket.onAny((event, payload) => {
      console.log(`📡 ${type} - Received event: ${event}`, payload);
      
      // Broadcast all events within this namespace
      namespace.emit(event, payload);
      console.log(`🔁 ${type} - Broadcasted: ${event}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔴 Client disconnected from ${type}:`, socket.id, 'Reason:', reason);
    });
  });
}

handleSocketEvents(messageNamespace, 'CHANNEL');
handleSocketEvents(directMessageNamespace, 'DIRECT MESSAGE');

  server.listen(port, () => {
    console.log(`> ✅ Ready on http://${hostname}:${port}`);
    console.log(`> 🌐 WebSocket path: http://${hostname}:${port}/api/web-socket/io`);
  });
});