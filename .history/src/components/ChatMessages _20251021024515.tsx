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

  // --- Fetch on mount ---
  useEffect(() => {
    fetchMessages();
  }, [paramKey, paramValue]);

  // --- Listen for real-time socket events ---
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      setMessages((prev) => [message, ...prev]);
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [socket]);

  // --- Render ---
  if (loading) return <div className="p-4">Loading messages...</div>;

  if (!isConnected)
    return <div className="p-4 text-gray-500">Connecting to chat...</div>;

  return (
    <div className="flex-1 overflow-auto p-4 space-y-3">
      <div className="text-sm text-green-600 mb-2">
        ✅ Connected — Socket ID: {socket?.id}
      </div>

      {messages.length === 0 ? (
        <div className="text-gray-400">No messages yet.</div>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg"
          >
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {msg.user?.full_name} —{" "}
              {new Date(msg.created_at).toLocaleTimeString()}
            </div>
            <div className="text-gray-900 dark:text-gray-100">
              {msg.content}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ChatMessages;
