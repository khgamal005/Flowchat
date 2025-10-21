// hooks/useSocket.ts
import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    const socketInstance = getSocket();
    setSocket(socketInstance);

    const handleConnect = () => {
      console.log("🟢 useSocket: Client connected with ID:", socketInstance.id);
      setIsConnected(true);
      setSocketId(socketInstance.id);
    };

    const handleDisconnect = () => {
      console.log("🔴 useSocket: Client disconnected, previous ID:", socketId);
      setIsConnected(false);
      setSocketId(null);
    };

    // Log initial state
    console.log("🔄 useSocket: Initializing socket connection...");
    console.log("📊 useSocket: Initial connection state:", socketInstance.connected);
    console.log("🆔 useSocket: Initial socket ID:", socketInstance.id);

    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);

    // Set initial connection state and ID
    setIsConnected(socketInstance.connected);
    if (socketInstance.connected) {
      setSocketId(socketInstance.id);
    }

    return () => {
      console.log("🧹 useSocket: Cleaning up socket connection...");
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
      socketInstance.disconnect();
    };
  }, []);

  console.log("🔄 useSocket: Current state - connected:", isConnected, "socketId:", socketId);

  return { socket, isConnected, socketId };
};