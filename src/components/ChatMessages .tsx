"use client";

import { useState } from "react";
import { useSocket } from "@/hooks/useSocket";

export default function ChatMessages() {
  const [msg, setMsg] = useState("");
  const { socket, isConnected, socketId } = useSocket();

  const sendMessage = () => {
    if (socket && msg.trim()) {
      socket.emit("message", msg);
      setMsg("");
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Socket Connection Status</h1>
        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
        <p className="text-gray-600 mt-2">
          Socket ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{socketId || 'Not connected'}</span>
        </p>
      </div>
      
      <div className="flex items-center">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          className="border p-2 rounded mr-2 flex-1"
          placeholder="Type message..."
          disabled={!isConnected}
        />
        <button 
          onClick={sendMessage} 
          className="bg-blue-500 text-white px-3 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!isConnected || !msg.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}