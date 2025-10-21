'use client';

import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
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
    if (socketInstance) {
      // ✅ Reuse existing socket
      setSocket(socketInstance);
      setIsConnected(socketInstance.connected);
      return;
    }
          console.log('🟢 Connected with socket ID:', sid);


    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
      window.location.origin;

    socketInstance = ClientIO(siteUrl, {
      path: '/api/web-socket/io',
      transports: ['websocket'],
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('🟢 Connected with socket ID:', socketInstance!.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('🔴 Disconnected from socket');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      // ❌ Don't disconnect globally unless you really want to tear down
      // socketInstance?.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
