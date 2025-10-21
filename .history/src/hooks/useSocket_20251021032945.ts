"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io({
      path: "/api/web-socket/io",
      transports: ["websocket"], // optional: more stable in Next.js
    });

    socketInstance.on("connect", () => {
      console.log("🟢 Connected:", socketInstance.id);
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return socket;
};
