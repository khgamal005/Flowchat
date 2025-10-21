'use client';

import { FC, ReactNode, createContext, useContext, useEffect, useState } from "react";
import { io as ClientIO, Socket } from "socket.io-client";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const WebSocketProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // ✅ Only run on client-side
    if (typeof window === "undefined") return;

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || window.location.origin;

    const socketInstance = ClientIO(siteUrl, {
      path: "/api/web-socket/io",
      transports: ["websocket"], // Prefer WebSocket, skip polling
      withCredentials: true,
      reconnectionAttempts: 5, // limit retries
      reconnectionDelay: 1000, // delay between retries
    });

    // ✅ Register connection events
    socketInstance.on("connect", () => {
      console.log("🟢 Connected to WebSocket server");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("🔴 Disconnected from WebSocket server");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (err) => {
      console.warn("⚠️ WebSocket connection error:", err.message);
    });

    setSocket(socketInstance);

    // ✅ Cleanup on unmount
    return () => {
      socketInstance.disconnect();
      setSocket(null);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
