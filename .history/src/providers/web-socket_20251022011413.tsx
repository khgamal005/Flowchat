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
  socketId: string | null;
};

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  socket: null,
  socketId: null,
});

export const useSocket = () => useContext(SocketContext);

export const WebSocketProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    console.log('🔄 WebSocketProvider: Connecting to:', siteUrl);

    const socketInstance = ClientIO(siteUrl, {
      path: '/api/web-socket/io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      console.log('🟢 Connected with ID:', socketInstance.id);
      setIsConnected(true);
      setSocketId(socketInstance.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('🔴 Disconnected:', reason);
      setIsConnected(false);
      setSocketId(null);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('💥 Connection error:', err.message);
    });

    setSocket(socketInstance);
    return () => socketInstance.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, socketId }}>
      {children}
    </SocketContext.Provider>
  );
};
