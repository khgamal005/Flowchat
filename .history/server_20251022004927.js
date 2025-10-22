// server.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

// Initialize Next.js
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

  // Initialize Socket.IO with more permissive CORS
  const io = new Server(server, {
    path: '/api/web-socket/io',
    cors: {
      origin: "*", // Try allowing all origins temporarily
      methods: ['GET', 'POST'],
    },
  });

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('🟢 Client connected:', socket.id);
    console.log('📡 Client headers:', socket.handshake.headers);

    socket.on('message', (data) => {
      console.log('📩 Received message:', data);
      io.emit('message', data);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔴 Client disconnected:', socket.id, 'Reason:', reason);
    });

    // Send a test message when client connects
    socket.emit('message', 'Welcome! Connected to server with ID: ' + socket.id);
  });

  server.once('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket path: http://${hostname}:${port}/api/web-socket/io`);
  });
});