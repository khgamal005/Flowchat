"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io({
      path: "/api/web-socket/io",
      transports: ["websocket"],
    });

    socketRef.current = socketInstance;

    const handleConnect = () => {
      console.log("🟢 Connected:", socketInstance.id);
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log("🔴 Disconnected");
      setIsConnected(false);
    };

    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);

    return () => {
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
      socketInstance.disconnect();
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
  };
};
