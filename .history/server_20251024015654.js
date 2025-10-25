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

 socket.onAny((eventName, data) => {
    console.log(`📩 Received event: ${eventName}`, data);
    console
    
    // Route events based on pattern
    if (eventName.includes('channel-messages')) {
      // For channel messages, broadcast to all in the channel
      if (eventName.includes(':channel-messages:update')) {
        io.emit(eventName, data); // Update events
      } else {
        io.emit(eventName, data); // New message events
      }
    } else if (eventName.includes('direct_messages')) {
      // For direct messages
      io.emit(eventName, data);
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
