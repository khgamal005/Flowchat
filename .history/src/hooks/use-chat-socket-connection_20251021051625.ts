// hooks/use-chat-socket-connection.ts
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/hooks/useSocket';
import { MessageWithUser } from '@/types/app';
import { useEffect, useCallback } from 'react';

type UseChatSocketConnectionProps = {
  addKey: string;
  queryKey: string;
  updateKey: string;
  paramValue: string;
};

export const useChatSocketConnection = ({
  addKey,
  paramValue,
  updateKey,
  queryKey,
}: UseChatSocketConnectionProps) => {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();

  const handleUpdateMessage = useCallback(
    (message: MessageWithUser) => {
      console.log("🔄 Updating message:", message.id);
      queryClient.setQueryData([queryKey, paramValue], (prev: any) => {
        if (!prev || !prev.pages || !prev.pages.length) return prev;

        const newData = prev.pages.map((page: any) => ({
          ...page,
          data: page.data.map((data: MessageWithUser) => (data.id === message.id ? message : data)),
        }));

        return {
          ...prev,
          pages: newData,
        };
      });
    },
    [paramValue, queryClient, queryKey]
  );

  const handleNewMessage = useCallback(
    (message: MessageWithUser) => {
      console.log("➕ Adding new message:", message.id);
      queryClient.setQueryData([queryKey, paramValue], (prev: any) => {
        if (!prev || !prev.pages || prev.pages.length === 0) return prev;

        const newPages = [...prev.pages];
        newPages[0] = {
          ...newPages[0],
          data: [message, ...newPages[0].data],
        };

        return {
          ...prev,
          pages: newPages,
        };
      });
    },
    [paramValue, queryClient, queryKey]
  );

  useEffect(() => {
    // ✅ Wait until socket is available AND connected
    if (!socket || !isConnected) {
      console.log('⏳ useChatSocketConnection: Waiting for socket connection...');
      return;
    }

    console.log('🎯 useChatSocketConnection: Setting up listeners for socket events:', { 
      addKey, 
      updateKey,
      socketId: socket.id 
    });

    socket.on(updateKey, handleUpdateMessage);
    socket.on(addKey, handleNewMessage);

    return () => {
      console.log('🧹 useChatSocketConnection: Cleaning up listeners');
      socket.off(updateKey, handleUpdateMessage);
      socket.off(addKey, handleNewMessage);
    };
  }, [socket, isConnected, addKey, updateKey, handleUpdateMessage, handleNewMessage]);

  return { isConnected, socketId: socket?.id };
};