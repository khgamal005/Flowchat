// hooks/useSocket.ts
'use client';

import { useEffect, useState } from "react";
import { io as ClientIO, Socket } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    // Use window location to ensure correct URL
    const siteUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'http://localhost:3000';

    console.log("🔄 useSocket: Initializing socket connection to:", siteUrl);

    const socketInstance = ClientIO(siteUrl, {
      path: '/api/web-socket/io',
      transports: ["websocket", "polling"],
      autoConnect: true,
      forceNew: true,
    });

    const handleConnect = () => {
      console.log("🟢 useSocket: Client connected with ID:", socketInstance.id);
      setIsConnected(true);
      setSocketId(socketInstance.id ?? null);
    };

    const handleDisconnect = (reason: string) => {
      console.log("🔴 useSocket: Client disconnected. Reason:", reason);
      setIsConnected(false);
      setSocketId(null);
    };

    const handleConnectError = (error: Error) => {
      console.log("💥 useSocket: Connection error:", error.message);
    };

    // Set up event listeners
    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);
    socketInstance.on("connect_error", handleConnectError);

    // Log transport updates
    socketInstance.io.on("transport" as any, (transport: any) => {
      console.log("📡 Transport changed to:", transport.name);
    });

    setSocket(socketInstance);

    return () => {
      console.log("🧹 useSocket: Cleaning up socket connection...");
      socketInstance.disconnect();
    };
  }, []);

  return { socket, isConnected, socketId };
};