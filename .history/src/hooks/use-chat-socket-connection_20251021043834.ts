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
  const { socket, isConnected } = useSocket(); // ✅ Now includes isConnected
  const queryClient = useQueryClient();

  const handleUpdateMessage = useCallback(
    (message: MessageWithUser) => {
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

    console.log('🎯 useChatSocketConnection: Setting up listeners for socket:', socket.id);
    console.log('📡 useChatSocketConnection: Listening for events:', { addKey, updateKey });

    socket.on(updateKey, handleUpdateMessage);
    socket.on(addKey, handleNewMessage);

    return () => {
      console.log('🧹 useChatSocketConnection: Cleaning up listeners');
      socket.off(updateKey, handleUpdateMessage);
      socket.off(addKey, handleNewMessage);
    };
  }, [socket, isConnected, addKey, updateKey, handleUpdateMessage, handleNewMessage]);

  // Optional: Return connection status for debugging
  return { isConnected, socketId: socket?.id };
};