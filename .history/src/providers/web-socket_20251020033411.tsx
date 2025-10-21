'use client';

import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  socket: null,
});

export const useSocket = () => useContext(SocketContext);

export const WebSocketProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;


    // Use explicit localhost URL to avoid any environment variable issues
    const socketUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const cleanUrl = socketUrl.replace(/\/$/, '');
    
    console.log('📡 Connecting to:', cleanUrl);

    // Create new socket instance
    const socketInstance = io(cleanUrl, {
      path: '/api/socket/io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      autoConnect: true,
      forceNew: true,
    });

    // Connection events
    socketInstance.on('connect', () => {
      console.log('🟢 Socket connected successfully. ID:', socketInstance.id);
      setIsConnected(true);
      setSocket(socketInstance);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('🔴 Socket disconnected. Reason:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error.message);
      setIsConnected(false);
      
      // Optional: Try to reconnect after error
      setTimeout(() => {
        if (!socketInstance.connected) {
          console.log('🔄 Attempting to reconnect...');
          socketInstance.connect();
        }
      }, 2000);
    });

    socketInstance.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 Reconnection attempt ${attempt}`);
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('❌ All reconnection attempts failed');
    });

    // Ping event for testing
    socketInstance.on('pong', (data) => {
      console.log('🏓 Received pong:', data);
    });

    // Store the instance
    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up socket connection');
      if (socketInstance) {
        socketInstance.removeAllListeners();
        socketInstance.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};