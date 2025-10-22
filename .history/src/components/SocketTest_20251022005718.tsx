// components/SocketTest.tsx
'use client';

import { useSocket } from '@/providers/web-socket';

export default function SocketTest() {
  const { socket, isConnected, socketId } = useSocket();

  const sendTestMessage = () => {
    if (socket) {
      console.log('📤 Sending test message via socket:', socket.id);
      socket.emit('message', 'Test message from client');
    } else {
      console.log('❌ No socket available');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-white border rounded-lg shadow-lg">
      <h3 className="font-bold mb-2">Socket Connection Test</h3>
      <div className={`px-2 py-1 rounded text-sm mb-2 ${
        isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        Status: {isConnected ? `Connected (${socketId})` : 'Disconnected'}
      </div>
      <button
        onClick={sendTestMessage}
        disabled={!isConnected}
        className="bg-blue-500 text-white px-3 py-1 rounded text-sm disabled:bg-gray-300"
      >
        Send Test Message
      </button>
    </div>
  );
}