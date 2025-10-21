import { NextRequest } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

// We store the socket instance globally so it persists across hot reloads in dev
const ioInstance = globalThis.io as SocketIOServer | undefined;

// If already exists, reuse it
if (!ioInstance) {
  console.log('🟢 Initializing new Socket.IO server...');

  const httpServer = new HTTPServer();
  const io = new SocketIOServer(httpServer, {
    path: '/api/web-socket/io',
    addTrailingSlash: false,
  });

  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected:', socket.id);
    });
  });

  globalThis.io = io;
}

export async function GET(_req: NextRequest) {
  return new Response('Socket.IO server is running', { status: 200 });
}
