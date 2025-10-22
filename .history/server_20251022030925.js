const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

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

    socket.on('message', (data) => {
      console.log('📩 Received message:', data);
      io.emit('message:new', data);
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
