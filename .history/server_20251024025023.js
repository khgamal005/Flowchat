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
      console.error('Error occurred handling', req.url, err);
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

  // 🔥 Make io globally available for Next API routes
  global._io = io;

  io.on('connection', (socket) => {
    console.log('🟢 Client connected:', socket.id);


  // Unified message handler
  socket.on('send-message', (data) => {
    const { type, chatId, message } = data;
    console.log('📨 Received message:', { type, chatId, message });

    if (type === 'Channel') {
      const eventName = `channel:${chatId}:channel-messages`;
      // Broadcast to everyone in the channel room
      socket.to(`channel:${chatId}`).emit(eventName, message);
      // Also emit to the sender for consistency (optional)
      socket.broadcast.emit(eventName, message);
    } else {
      // Direct message
      socket.broadcast.emit('direct_messages:post', message);
    }
  });

  // Unified update handler
  socket.on('update-message', (data) => {
    const { type, chatId, message } = data;
    console.log('✏️ Received message update:', { type, chatId, message });

    if (type === 'Channel') {
      const eventName = `channel:${chatId}:channel-messages:update`;
      socket.to(`channel:${chatId}`).emit(eventName, message);
      socket.broadcast.emit(eventName, message);
    } else {
      socket.broadcast.emit('direct_messages:update', message);
    }
  });


    socket.on('disconnect', (reason) => {
      console.log('🔴 Client disconnected:', socket.id, 'Reason:', reason);
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket path: http://${hostname}:${port}/api/web-socket/io`);
  });
});
