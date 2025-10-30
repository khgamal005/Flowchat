// server.js
import { createServer } from 'http';
import next from 'next';
import { Server } from 'socket.io';
import { parse } from 'url';

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

  io.on('connection', (socket) => {
    console.log('🟢 Client connected:', socket.id);

    // ✅ generic listener
    socket.onAny((event, payload) => {
      console.log(`📡 Received event: ${event}`);

      if (event.startsWith('channel:') || event.startsWith('direct:')) {
        io.emit(event, payload);
        console.log(`🔁 Broadcasted: ${event}`);
      } else {
        console.log(`⚠️ Ignored unknown event: ${event}`);
      }
    });

    // ✅ specific DM listener (outside of onAny)
    // socket.on('direct:message:new', (payload) => {
    //   console.log('🔥 direct:message:new received!', payload);
    //   io.emit('direct:message:new', payload);
    // });

    socket.on('disconnect', (reason) => {
      console.log('🔴 Disconnected:', socket.id, 'Reason:', reason);
    });
  });

  server.listen(port, () => {
    console.log(`✅ Server ready at http://${hostname}:${port}`);
    console.log(`🌐 Socket path: http://${hostname}:${port}/api/web-socket/io`);
  });
});
