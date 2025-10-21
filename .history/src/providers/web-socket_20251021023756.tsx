// src/providers/web-socket.tsx
"use client";

import { createContext, useContext } from "react";
import { io, Socket } from "socket.io-client";

// ✅ Create one global socket instance (module-scoped)
const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "", {
  transports: ["websocket"],
  withCredentials: true, // ✅ keep cookies if your server uses them
});
console.log("🌐 WebSocket initialized:", socket);

const SocketContext = createContext<Socket>(socket);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
