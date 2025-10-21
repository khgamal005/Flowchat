'use client';

import { FC, useEffect, useState } from "react";
import { useSocket } from "@/providers/web-socket";
import { MessageWithUser } from "@/types/app";

type ChatMessagesProps = {
  apiUrl: string;
  paramKey: "channelId" | "recipientId";
  paramValue: string;
  socketQuery?: Record<string, string>; // optional if you want to pass channel/workspace info
};

const ChatMessages: FC<ChatMessagesProps> = ({
  apiUrl,
  paramKey,
  paramValue,
  socketQuery,
}) => {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<MessageWithUser[]>([]);

  // Listen for socket messages
  useEffect(() => {
    if (!socket || !isConnected) return;

    // You can use paramValue to create a unique event name per channel/DM
    const eventKey = `newMessage:${paramValue}`;

    const handleMessage = (msg: MessageWithUser) => {
      setMessages((prev) => [msg, ...prev]); // prepend newest messages
    };

    socket.on(eventKey, handleMessage);

    return () => {
      socket.off(eventKey, handleMessage);
    };
  }, [socket, isConnected, paramValue]);

  // Optional: fetch initial messages from API
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const query = `${apiUrl}?${paramKey}=${paramValue}`;
        const res = await fetch(query);
        const data = (await res.json()) as MessageWithUser[];
        setMessages(data.reverse()); // show oldest at top
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    };

    fetchMessages();
  }, [apiUrl, paramKey, paramValue]);

  return (
    <div className="flex-1 overflow-auto p-4">
      {isConnected ? (
        messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <strong>{msg.user.name}:</strong> {msg.content}
          </div>
        ))
      ) : (
        <div>Connecting...</div>
      )}
    </div>
  );
};

export default ChatMessages;
