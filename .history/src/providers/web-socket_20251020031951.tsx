'use client';

import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { io as ClientIO, Socket } from 'socket.io-client';

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  socket: null,
});

export const useSocket = () => useContext(SocketContext);

// 🧠 Global variable (prevents multiple socket creations)
let socketInstance: Socket | null = null;

export const WebSocketProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection only once
    if (!socketInstance) {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
        window.location.origin;

      console.log('🔗 Connecting to:', socket?.id);

      socketInstance = ClientIO(siteUrl, {
        path: '/api/web-socket/io',
        transports: ['websocket', 'polling'], // Add polling as fallback
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
      });

      socketInstance.on('connect', () => {
        console.log('🟢 Connected with socket ID:', socketInstance!.id);
        setIsConnected(true);
        setSocket(socketInstance);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('🔴 Disconnected from socket:', reason);
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('🔴 Connection error:', error.message);
        setIsConnected(false);
      });

      // Set socket immediately (even if not connected yet)
      setSocket(socketInstance);
    } else {
      // Reuse existing socket
      setSocket(socketInstance);
      setIsConnected(socketInstance.connected);
    }

    return () => {
      // Optional: Cleanup on component unmount
      // But don't disconnect the global instance
      // socketInstance?.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};