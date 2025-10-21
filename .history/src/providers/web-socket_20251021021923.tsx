"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { createClient } from "@supabase/supabase-js";

const SocketContext = createContext<Socket | null>(null);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const initSocket = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;

      // Create socket instance with Supabase token
      const s = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
        transports: ["websocket"],
        auth: { token },
      });

      // 🔄 Update token automatically when Supabase refreshes session
      const { data: listener } = supabase.auth.onAuthStateChange(
        async (_event, newSession) => {
          if (newSession?.access_token) {
            s.auth = { token: newSession.access_token };
            s.connect(); // reconnect with new token
          }
        }
      );

      s.on("connect", () => console.log("🟢 Socket connected:", s.id));
      s.on("disconnect", () => console.log("🔴 Socket disconnected"));

      setSocket(s);

      return () => {
        s.disconnect();
        listener.subscription.unsubscribe();
      };
    };

    initSocket();
  }, []);

  if (!socket) return null; // Optional: wait until socket is ready

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = (): Socket => {
  const socket = useContext(SocketContext);
  if (!socket) throw new Error("useSocket must be used within WebSocketProvider");
  return socket;
};
