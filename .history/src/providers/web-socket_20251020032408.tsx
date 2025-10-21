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

let socketInstance: Socket | null = null;

export const WebSocketProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempt, setConnectionAttempt] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initializeSocket = async () => {
      if (socketInstance && socketInstance.connected) {
        setSocket(socketInstance);
        setIsConnected(true);
        return;
      }

      try {
        // Use window.location.origin directly to avoid env variable issues
        const siteUrl = window.location.origin;
        console.log('🔗 Connecting to:', siteUrl);

        if (socketInstance) {
          socketInstance.disconnect();
          socketInstance = null;
        }

        socketInstance = ClientIO(siteUrl, {
          path: '/api/web-socket/io',
          transports: ['websocket', 'polling'],
          reconnectionAttempts: 3,
          reconnectionDelay: 2000,
          timeout: 15000,
        });

        socketInstance.on('connect', () => {
          console.log('🟢 Socket connected:', socketInstance!.id);
          setIsConnected(true);
        });

        socketInstance.on('disconnect', (reason) => {
          console.log('🔴 Socket disconnected:', reason);
          setIsConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
          console.error('🔴 Socket connection error:', error.message);
          setIsConnected(false);
        });

        setSocket(socketInstance);
        
      } catch (error) {
        console.error('🔴 Failed to initialize socket:', error);
      }
    };

    initializeSocket();

    return () => {
      // Don't disconnect here to maintain connection across route changes
    };
  }, [connectionAttempt]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};