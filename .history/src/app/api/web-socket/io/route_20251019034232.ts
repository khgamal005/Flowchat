import { NextRequest } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

if (!globalThis.io) {
  console.log('🟢 Initializing Socket.IO server...');
  const httpServer = new HTTPServer();

  const io = new SocketIOServer(httpServer, {
    path: '/api/web-socket/io',
    addTrailingSlash: false,
  });

  io.on('connection', (socket) => {
    console.log('✅ Connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('❌ Disconnected:', socket.id);
    });
  });

  globalThis.io = io;
} else {
  console.log('🟡 Socket.IO server already running.');
}

export async function GET(_req: NextRequest) {
  return new Response('Socket.IO server running', { status: 200 });
}
