import { NextRequest, NextResponse } from 'next/server';
import { Server as IOServer } from 'socket.io';

// 👇 Use a global variable to persist the Socket.IO instance across hot reloads
const io: IOServer =
  globalThis.io ||
  new IOServer({
    path: '/api/web-socket/io',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_SITE_URL || '*',
      credentials: true,
    },
  });

// ✅ Only initialize listeners once
if (!globalThis.io) {
  console.log('🟢 Initializing Socket.IO server...');

  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });

  // Persist globally to prevent reinitialization
  globalThis.io = io;
} else {
  console.log('🟡 Socket.IO server already running.');
}

// ✅ Return a simple success response
export async function GET(_req: NextRequest) {
  return NextResponse.json(
    { message: 'Socket.IO server running' },
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || '*',
        'Access-Control-Allow-Credentials': 'true',
      },
    }
  );
}

// ✅ (Optional) Preflight for browsers (CORS)
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
