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
    console.log('🎯 WebSocketProvider: useEffect triggered');
    
    // Use window location for better reliability
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL 

    console.log('🔄 WebSocketProvider: Initializing socket connection to:', siteUrl);
    console.log('🔧 WebSocketProvider: Environment URL:', process.env.NEXT_PUBLIC_SITE_URL);
    console.log('🔧 WebSocketProvider: Window origin:', typeof window !== 'undefined' ? window.location.origin : 'undefined');

    if (!siteUrl) {
      console.log('❌ WebSocketProvider: No site URL available');
      return;
    }

    console.log('🔌 WebSocketProvider: Creating Socket.IO instance...');
    
    const socketInstance = ClientIO(siteUrl, {
      path: '/api/web-socket/io',
      addTrailingSlash: false,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      timeout: 10000,
    });

    console.log('🔌 WebSocketProvider: Socket instance created:', !!socketInstance);
    console.log('🔌 WebSocketProvider: Socket initial connected state:', socketInstance.connected);
    console.log('🔌 WebSocketProvider: Socket initial ID:', socketInstance.id);

    const handleConnect = () => {
      console.log('🟢 WebSocketProvider: CLIENT CONNECTED with ID:', socketInstance.id);
      console.log('📡 WebSocketProvider: Transport:', socketInstance.io.engine.transport.name);
      setIsConnected(true);
      setSocketId(socketInstance.id);
    };

    const handleDisconnect = (reason: string) => {
      console.log('🔴 WebSocketProvider: CLIENT DISCONNECTED. Reason:', reason);
      setIsConnected(false);
      setSocketId(null);
    };

    const handleConnectError = (error: Error) => {
      console.log('💥 WebSocketProvider: CONNECTION ERROR:', error.message);
      console.log('💥 WebSocketProvider: Error stack:', error.stack);
    };

    const handleReconnect = (attempt: number) => {
      console.log('🔄 WebSocketProvider: Reconnecting, attempt:', attempt);
    };

    const handleReconnectError = (error: Error) => {
      console.log('💥 WebSocketProvider: Reconnection error:', error);
    };

    // Set up event listeners
    console.log('🎧 WebSocketProvider: Setting up event listeners...');
    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);
    socketInstance.on('connect_error', handleConnectError);
    socketInstance.on('reconnect', handleReconnect);
    socketInstance.on('reconnect_error', handleReconnectError);

    // Monitor transport changes
    socketInstance.io.engine.on('transport', (transport) => {
      console.log('📡 WebSocketProvider: Transport changed to:', transport.name);
    });

    // Monitor upgrade
    socketInstance.io.engine.on('upgrade', (transport) => {
      console.log('⬆️ WebSocketProvider: Transport upgraded to:', transport.name);
    });

    // Monitor connection attempts
    socketInstance.io.on('open', () => {
      console.log('🔗 WebSocketProvider: Socket.IO connection opened');
    });

    socketInstance.io.on('close', (reason) => {
      console.log('🔗 WebSocketProvider: Socket.IO connection closed:', reason);
    });

    setSocket(socketInstance);
    console.log('✅ WebSocketProvider: Socket instance set in state');

    // Cleanup function
    return () => {
      console.log('🧹 WebSocketProvider: Cleaning up socket connection...');
      socketInstance.disconnect();
    };
  }, []);

  console.log('📊 WebSocketProvider: RENDER - connected:', isConnected, 'socketId:', socketId, 'socket:', socket?.id);

  return (
    <SocketContext.Provider value={{ socket, isConnected, socketId }}>
      {children}
    </SocketContext.Provider>
  );
};