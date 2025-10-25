import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { useSocket } from '@/providers/web-socket';
import { MessageWithUser } from '@/types/app';

type UseChatSocketConnectionProps = {
  addKey: string;
  updateKey: string;
  deleteKey: string; // 🆕 added
  queryKey: string;
  paramValue: string;
  enabled?: boolean;
};

export const useChatSocketConnection = ({
  addKey,
  updateKey,
  deleteKey, // 🆕 added
  queryKey,
  paramValue,
  enabled = true,
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

        const exists = prev.pages[0].data.some(
          (msg: MessageWithUser) => msg.id === message.id
        );
        if (exists) return prev;

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

  const handleDeleteMessage = useCallback(
    ({ messageId }: { messageId: string }) => {
      queryClient.setQueryData([queryKey, paramValue], (prev: any) => {
        if (!prev?.pages?.length) return prev;
        const updatedPages = prev.pages.map((page: any) => ({
          ...page,
          data: page.data.filter((msg: MessageWithUser) => msg.id !== messageId),
        }));
        return { ...prev, pages: updatedPages };
      });
    },
    [queryClient, queryKey, paramValue]
  );

  useEffect(() => {
    if (!socket || !enabled) return;

    console.log('🔌 Socket listeners set:', { addKey, updateKey, deleteKey });

    socket.on(addKey, handleNewMessage);
    socket.on(updateKey, handleUpdateMessage);
    socket.on(deleteKey, handleDeleteMessage); // 🆕

    return () => {
      socket.off(addKey, handleNewMessage);
      socket.off(updateKey, handleUpdateMessage);
      socket.off(deleteKey, handleDeleteMessage);
    };
  }, [
    socket,
    addKey,
    updateKey,
    deleteKey, // 🆕
    handleNewMessage,
    handleUpdateMessage,
    handleDeleteMessage,
    enabled,
  ]);
};
