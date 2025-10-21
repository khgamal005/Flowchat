"use client";

import { FC, useEffect, useState } from "react";
import axios from "axios";
import { useSocket } from "@/providers/web-socket";

type User = {
  id: string;
  full_name: string;
  avatar_url?: string;
};

type Message = {
  id: string;
  content: string;
  created_at: string;
  user: User;
};

type ChatMessagesProps = {
  apiUrl: string; // e.g. /api/messages
  paramKey: "channelId" | "recipientId";
  paramValue: string;
};

const ChatMessages: FC<ChatMessagesProps> = ({
  apiUrl,
  paramKey,
  paramValue,
}) => {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Fetch messages from the API route ---
  const fetchMessages = async () => {
    try {
      const res = await axios.get(apiUrl, {
        params: {
          [paramKey]: paramValue,
          page: 0,
          size: 20,
        },
      });
      setMessages(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---
  if (loading) return <div className="p-4">Loading messages...</div>;

  if (!isConnected)
    return <div className="p-4 text-gray-500">Connecting to chat...</div>;

  return (
    <div className="flex-1 overflow-auto p-4 space-y-3">
      <div className="text-sm text-green-600 mb-2">
        ✅ Connected — Socket ID: {socket?.id}
      </div>
    </div>
  );
};

export default ChatMessages;

"use client";

import { useState } from "react";
import { useSocket } from "@/hooks/useSocket";

export default function ChatPage() {
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
      <h1 className="text-xl font-semibold mb-2">Realtime Chat</h1>
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
