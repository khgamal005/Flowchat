"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io({
      path: "/api/socket_io",
    });

    socket.on("connect", () => {
      console.log("🟢 Connected:", socket.id);
    });

    socket.on("message", (msg) => {
      console.log("💬 Message:", msg);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef;
};
