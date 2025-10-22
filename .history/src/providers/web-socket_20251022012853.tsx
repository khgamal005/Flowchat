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
  const socketInstance = ClientIO(siteUrl, {
    path: '/api/web-socket/io',
  });

  socketInstance.on('connect', () => {
    console.log('Connected:', socketInstance.id);
    setIsConnected(true);
    setSocketId(socketInstance.id ?? null); // ✅ Safe fix
  });

  socketInstance.on('disconnect', () => {
    setIsConnected(false);
    setSocketId(null);
  });

  setSocket(socketInstance);

  return () => {
    socketInstance.disconnect();
  };
}, []);



  return (
    <SocketContext.Provider value={{ socket, isConnected, socketId }}>
      {children}
    </SocketContext.Provider>
  );
};
