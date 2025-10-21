'use client';

import { FC, useEffect } from "react";
import { useSocket } from "@/providers/web-socket";
import { MessageWithUser } from "@/types/app";

type ChatMessagesProps = {
  socketQuery: Record<string, string>;
  paramKey: string;
  paramValue: string;
  apiUrl: string;
};

const ChatMessages: FC<ChatMessagesProps> = ({
  socketQuery,
  paramKey,
  paramValue,
  apiUrl,
}) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const eventKey = `newMessage:${paramValue}`;

    const handleMessage = (message: MessageWithUser) => {
      console.log("Received message:", message);
      // TODO: Update your state or react-query cache here
    };

    socket.on(eventKey, handleMessage);

    return () => {
      socket.off(eventKey, handleMessage);
    };
  }, [socket, isConnected, paramValue]);

  return <div>{isConnected ? "Connected to chat" : "Connecting..."}</div>;
};

export default ChatMessages;
