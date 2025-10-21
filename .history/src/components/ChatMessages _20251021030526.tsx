
"use client";

import { useState } from "react";
import { useSocket } from "@/hooks/useSocket";

export default function ChatMessages() {
  const [msg, setMsg] = useState("");
  const socketRef = useSocket();


  const sendMessage = () => {
    if (socketRef.current && msg.trim()) {
      socketRef.current.emit("message", msg);
      setMsg("");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-2">{so}</h1>
      <input
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        className="border p-2 rounded mr-2"
        placeholder="Type message..."
      />
      <button onClick={sendMessage} className="bg-blue-500 text-white px-3 py-2 rounded">
        Send
      </button>
    </div>
  );
}
