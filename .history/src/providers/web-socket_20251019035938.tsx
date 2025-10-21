'use client';

import { FC, ReactNode, createContext, useContext, useEffect, useState } from "react";
import { io as ClientIO, Socket } from "socket.io-client";

type SocketContextType = { socket: Socket | null; isConnected: boolean; };
const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export const WebSocketProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const socketInstance = ClientIO(url, {
      path: "/api/web-socket/io",
      transports: ["websocket"], // force WebSocket instead of polling
    });

    socketInstance.on("connect", () => setIsConnected(true));
    socketInstance.on("disconnect", () => setIsConnected(false));
    setSocket(socketInstance);

    return () => socketInstance.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
