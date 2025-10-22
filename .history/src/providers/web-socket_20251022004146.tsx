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

export const WebSocketProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    // Use window location for better reliability
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                   (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    console.log('🔄 WebSocketProvider: Initializing socket connection to:', siteUrl);

    if (!siteUrl) {
      console.log('❌ WebSocketProvider: No site URL available');
      return;
    }

    const socketInstance = ClientIO(siteUrl, {
      path: '/api/web-socket/io',
      addTrailingSlash: false,
      transports: ['websocket', 'polling'], // Add polling as fallback
      autoConnect: true,
    });

    const handleConnect = () => {
      console.log('🟢 WebSocketProvider: Client connected with ID:', socketInstance.id);
      setIsConnected(true);
      setSocketId(socketInstance.id);
    };

    const handleDisconnect = (reason: string) => {
      console.log('🔴 WebSocketProvider: Client disconnected. Reason:', reason);
      console.log('🔴 Previous socket ID was:', socketId);
      setIsConnected(false);
      setSocketId(null);
    };

    const handleConnectError = (error: Error) => {
      console.log('💥 WebSocketProvider: Connection error:', error.message);
    };

    // Set up event listeners
    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);
    socketInstance.on('connect_error', handleConnectError);

    // Set initial state if already connected
    if (socketInstance.connected) {
      console.log('⚡ WebSocketProvider: Socket already connected on init, ID:', socketInstance.id);
      setIsConnected(true);
      setSocketId(socketInstance.id);
    }

    setSocket(socketInstance);

    // Log the socket creation
    console.log('🎯 WebSocketProvider: Socket instance created, initial ID:', socketInstance.id);
    console.log('📡 WebSocketProvider: Initial connection state:', socketInstance.connected);

    // Cleanup function
    return () => {
      console.log('🧹 WebSocketProvider: Cleaning up socket connection...');
      console.log('🧹 WebSocketProvider: Current socket ID before cleanup:', socketInstance.id);
      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);
      socketInstance.off('connect_error', handleConnectError);
      socketInstance.disconnect();
    };
  }, []); // ✅ Empty dependency array - no infinite re-renders

  // Log state changes
  console.log('📊 WebSocketProvider: Current state - connected:', isConnected, 'socketId:', socketId, 'socket:', socket?.id);

  return (
    <SocketContext.Provider value={{ socket, isConnected, socketId }}>
      {children}
    </SocketContext.Provider>
  );
};