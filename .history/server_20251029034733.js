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
    // Remove the path option or set it to just '/socket.io'
    // path: '/api/web-socket/io',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // 🔥 Channel Messages Namespace
  const channelNamespace = io.of('/api/web-socket/messages');
  channelNamespace.on('connection', (socket) => {
    console.log('💬 Client connected to CHANNEL namespace:', socket.id);

    socket.onAny((event, payload) => {
      console.log(`📡 Channel event: ${event}`, payload);
      
      // Remove the condition to handle all events in this namespace
      channelNamespace.emit(event, payload);
      console.log(`🔁 Broadcasted channel event: ${event}`);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔴 Client disconnected from CHANNEL namespace:', socket.id, 'Reason:', reason);
    });
  });

  // 🔥 Direct Messages Namespace
  const directMessageNamespace = io.of('/api/web-socket/direct-messages');
  directMessageNamespace.on('connection', (socket) => {
    console.log('📩 Client connected to DIRECT MESSAGE namespace:', socket.id);

    socket.onAny((event, payload) => {
      console.log(`📡 Direct message event: ${event}`, payload);
      
      // Remove the condition to handle all events in this namespace
      directMessageNamespace.emit(event, payload);
      console.log(`🔁 Broadcasted direct message event: ${event}`);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔴 Client disconnected from DIRECT MESSAGE namespace:', socket.id, 'Reason:', reason);
    });
  });

  server.listen(port, () => {
    console.log(`> ✅ Ready on http://${hostname}:${port}`);
    console.log(`> 🌐 WebSocket paths:`);
    console.log(`>   - http://${hostname}:${port}/api/web-socket/messages`);
    console.log(`>   - http://${hostname}:${port}/api/web-socket/direct-messages`); 
  });
});