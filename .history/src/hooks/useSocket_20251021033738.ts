import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

export const useSocket = () => {
  const [socket, setSocket] = useState(() => getSocket());
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket]);

  return { socket, isConnected };
};
