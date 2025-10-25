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

    // Listen for channel messages
    socket.on('channel-messages', (message) => {
      console.log('📨 Received channel message:', message);
      
      // Broadcast to all other clients in the same channel
      socket.broadcast.emit('channel-messages', message);
      
      // Or broadcast to specific room if you implement rooms
      // socket.to(message.channelId).emit('channel-messages', message);
    });

    // Listen for direct messages
    socket.on('direct_messages:post', (message) => {
      console.log('📨 Received direct message:', message);
      
      // Broadcast to all other clients
      socket.broadcast.emit('direct_messages:post', message);
      
      // Or send to specific user if you have user IDs
      // socket.to(message.receiverId).emit('direct_messages:post', message);
    });

    // Listen for message updates
    socket.on('channel-messages:update', (updatedMessage) => {
      console.log('✏️ Received message update:', updatedMessage);
      socket.broadcast.emit('channel-messages:update', updatedMessage);
    });

    socket.on('direct_messages:update', (updatedMessage) => {
      console.log('✏️ Received direct message update:', updatedMessage);
      socket.broadcast.emit('direct_messages:update', updatedMessage);
    });

    // Optional: Handle joining rooms for specific channels
    socket.on('join-channel', (channelId) => {
      socket.join(channelId);
      console.log(`👥 Socket ${socket.id} joined channel: ${channelId}`);
    });

    socket.on('leave-channel', (channelId) => {
      socket.leave(channelId);
      console.log(`👋 Socket ${socket.id} left channel: ${channelId}`);
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