import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';

import { useSocket } from '@/providers/web-socket';
import { MessageWithUser } from '@/types/app';

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
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const handleUpdateMessage = useCallback((message: any) => {
    queryClient.setQueryData([queryKey, paramValue], (prev: any) => {
      if (!prev || !prev.pages || !prev.pages.length) return prev;

      const newData = prev.pages.map((page: any) => ({
        ...page,
        data: page.data.map((data: MessageWithUser) => {
          if (data.id === message.id) {
            return message;
          }
          return data;
        }),
      }));

      return {
        ...prev,
        pages: newData,
      };
    });
  }, [queryClient, queryKey, paramValue]);

  const handleNewMessage = useCallback((message: MessageWithUser) => {
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
  }, [queryClient, queryKey, paramValue]);

  useEffect(() => {
    if (!socket) return;

    socket.on(updateKey, handleUpdateMessage);
    socket.on(addKey, handleNewMessage);

    return () => {
      socket.off(updateKey, handleUpdateMessage);
      socket.off(addKey, handleNewMessage);
    };
  }, [socket, updateKey, addKey, handleUpdateMessage, handleNewMessage]);
};