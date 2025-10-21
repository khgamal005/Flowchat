"use client";

import { FC, useEffect, useState } from "react";
import { useSocket } from "@/providers/web-socket";

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


  return (
    <div className="flex-1 overflow-auto p-4">
      {!isConnected ? (
        <div>Connecting...</div>
      ) : (
        <>
          <div className="text-green-600 mb-2">
            ✅ Connected — Socket ID: {socketId}
          </div>
          
        </>
      )}
    </div>
  );
};

export default ChatMessages;

