// hooks/useSocket.ts
'use client';

import { useEffect, useState } from "react";
import { io as ClientIO, Socket } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    console.log("🔄 useSocket: Initializing socket connection to:", siteUrl);

    const socketInstance = ClientIO(siteUrl, {
      path: '/api/web-socket/io',
      addTrailingSlash: false,
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: true,
    });

    const handleConnect = () => {
      console.log("🟢 useSocket: Client connected with ID:", socketInstance.id);
      setIsConnected(true);
      setSocketId(socketInstance.id);
    };

    const handleDisconnect = () => {
      console.log("🔴 useSocket: Client disconnected");
      setIsConnected(false);
      setSocketId(null);
    };

    const handleConnectError = (error: Error) => {
      console.log("💥 useSocket: Connection error:", error.message);
    };

    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);
    socketInstance.on("connect_error", handleConnectError);

    setSocket(socketInstance);

    return () => {
      console.log("🧹 useSocket: Cleaning up socket connection...");
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
      socketInstance.off("connect_error", handleConnectError);
      socketInstance.disconnect();
    };
  }, []);

  console.log("📊 useSocket: Current state - connected:", isConnected, "socketId:", socketId);

  return { socket, isConnected, socketId };
};