"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const sock = io({ transports: ["websocket"], withCredentials: true });
    setSocket(sock);

    sock.on("connect", () => console.log("🟢 Socket connected:", sock.id));
    sock.on("disconnect", () => console.log("🔴 Socket disconnected:", sock.id));

    return () => sock.disconnect();
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
