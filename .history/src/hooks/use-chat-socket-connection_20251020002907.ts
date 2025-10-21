import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/providers/web-socket';
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
  const { socket } = useSocket();
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
    if (!socket) return;

    socket.on(updateKey, handleUpdateMessage);
    socket.on(addKey, handleNewMessage);

    return () => {
      socket.off(updateKey, handleUpdateMessage);
      socket.off(addKey, handleNewMessage);
    };
  }, [socket, addKey, updateKey, handleUpdateMessage, handleNewMessage]);
};
