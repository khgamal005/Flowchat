"use client";

import { useState } from "react";
import { useSocket } from "@/hooks/useSocket";

export default function ChatPage() {
  const socketRef = useSocket();
  const [msg, setMsg] = useState("");

  const send = () => {
    if (socketRef.current && msg.trim()) {
      socketRef.current.emit("message", msg);
      setMsg("");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Realtime Chat</h1>
      <input
        className="border p-2 rounded mr-2"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={send} className="bg-blue-500 text-white px-3 py-2 rounded">
        Send
      </button>
    </div>
  );
}
