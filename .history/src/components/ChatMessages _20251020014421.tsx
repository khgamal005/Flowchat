"use client";

import { FC, useEffect, useState } from "react";
import { useSocket } from "@/providers/web-socket";
import { MessageWithUser } from "@/types/app";

type ChatMessagesProps = {
  apiUrl: string;
  paramKey: "channelId" | "recipientId";
  paramValue: string;
  socketQuery?: Record<string, string>;
};

const ChatMessages: FC<ChatMessagesProps> = ({
  apiUrl,
  paramKey,
  paramValue,
  socketQuery,
}) => {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      console.log("✅ Connected to socket:", socket.id);
      setSocketId(socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from socket");
      setSocketId(null);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !isConnected) return;
    const eventKey = `newMessage:${paramValue}`;

    const handleMessage = (msg: MessageWithUser) => {
      setMessages((prev) => [msg, ...prev]);
    };

    socket.on(eventKey, handleMessage);

    return () => {
      socket.off(eventKey, handleMessage);
    };
  }, [socket, isConnected, paramValue]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const query = `${apiUrl}?${paramKey}=${paramValue}`;
        const res = await fetch(query);
        const data = (await res.json()) as MessageWithUser[];
        setMessages(data.reverse());
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    };

    fetchMessages();
  }, [apiUrl, paramKey, paramValue]);

  return (
    <div className="flex-1 overflow-auto p-4">
      {!isConnected ? (
        <div>Connecting...</div>
      ) : (
        <>
          <div className="text-green-600 mb-2">
            ✅ Connected — Socket ID: {socketId}
          </div>
          {messages.map((msg) => (
            <div key={msg.id} className="mb-2">
              <strong>{msg.user.name}:</strong> {msg.content}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default ChatMessages;

