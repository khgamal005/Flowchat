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

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      console.log('🚫 Running on server side, skipping socket initialization');
      return;
    }

    console.log('🏁 Starting socket initialization...');
    console.log('📊 Environment check:', {
      hasSiteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      windowOrigin: window.location.origin,
      hasSocketInstance: !!socketInstance
    });

    if (socketInstance) {
      console.log('♻️ Reusing existing socket instance');
      setSocket(socketInstance);
      setIsConnected(socketInstance.connected);
      return;
    }

    try {
      // Use environment variable or fallback to window origin
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const cleanUrl = siteUrl.replace(/\/$/, '');
      
      console.log('🔗 Creating new socket connection to:', cleanUrl);

      socketInstance = ClientIO(cleanUrl, {
        path: '/api/web-socket/io',
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        autoConnect: true,
      });

      socketInstance.on('connect', () => {
        console.log('🟢 Socket connected successfully. ID:', socketInstance!.id);
        setIsConnected(true);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('🔴 Socket disconnected. Reason:', reason);
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('🔴 Socket connection error:', error.message);
        console.error('Error details:', error);
        setIsConnected(false);
      });

      socketInstance.on('reconnect_attempt', (attempt) => {
        console.log(`🔄 Reconnection attempt ${attempt}`);
      });

      socketInstance.on('reconnect_failed', () => {
        console.error('❌ All reconnection attempts failed');
      });

      setSocket(socketInstance);
      console.log('✅ Socket instance created and configured');

    } catch (error) {
      console.error('💥 Failed to create socket instance:', error);
    }

    return () => {
      console.log('🧹 Socket provider unmounting');
      // Don't disconnect here to maintain connection
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};