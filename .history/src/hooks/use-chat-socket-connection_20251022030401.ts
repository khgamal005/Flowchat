import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { useSocket } from '@/providers/web-socket';
import { MessageWithUser } from '@/types/app';
import type { Socket } from 'socket.io-client';

type UseChatSocketConnectionProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
  paramValue: string;
};

export const useChatSocketConnection = ({
  addKey,
  updateKey,
  queryKey,
  paramValue,
}: UseChatSocketConnectionProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const handleUpdateMessage = useCallback(
    (message: MessageWithUser) => {
      queryClient.setQueryData([queryKey, paramValue], (prev: any) => {
        if (!prev?.pages?.length) return prev;

        const updatedPages = prev.pages.map((page: any) => ({
          ...page,
          data: page.data.map((msg: MessageWithUser) =>
            msg.id === message.id ? message : msg
          ),
        }));

        return { ...prev, pages: updatedPages };
      });
    },
    [queryClient, queryKey, paramValue]
  );

  const handleNewMessage = useCallback(
    (message: MessageWithUser) => {
      queryClient.setQueryData([queryKey, paramValue], (prev: any) => {
        if (!prev?.pages?.length) return prev;

        const updatedPages = [...prev.pages];
        updatedPages[0] = {
          ...updatedPages[0],
          data: [message, ...updatedPages[0].data],
        };

        return { ...prev, pages: updatedPages };
      });
    },
    [queryClient, queryKey, paramValue]
  );

  useEffect(() => {
    if (!socket) return;

    socket.on(updateKey, handleUpdateMessage);
    socket.on(addKey, handleNewMessage);

    // Cleanup
    return () => {
      socket.off(updateKey, handleUpdateMessage);
      socket.off(addKey, handleNewMessage);
    };
  }, [socket, updateKey, addKey, handleUpdateMessage, handleNewMessage]);
};
