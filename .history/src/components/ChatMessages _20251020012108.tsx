'use client';

import { FC, useEffect, useState } from "react";
import { useSocket } from "@/providers/web-socket";
import { MessageWithUser } from "@/types/app";

type ChatMessagesProps = {
  channelId: string;
};

const ChatMessages: FC<ChatMessagesProps> = ({ channelId }) => {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<MessageWithUser[]>([]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const eventKey = `newMessage:${channelId}`;

    const handleMessage = (msg: MessageWithUser) => {
      setMessages(prev => [msg, ...prev]);
    };

    socket.on(eventKey, handleMessage);

    return () => {
      socket.off(eventKey, handleMessage);
    };
  }, [socket, isConnected, channelId]);

  return (
    <div className="flex-1 overflow-auto p-4">
      {isConnected ? (
        messages.map(msg => (
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
