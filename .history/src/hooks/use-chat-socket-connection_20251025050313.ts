import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { useSocket } from '@/providers/web-socket';
import { MessageWithUser } from '@/types/app';

type UseChatSocketConnectionProps = {
  addKey: string;
  updateKey: string;
  deleteKey: string;
  queryKey: string;
  paramValue: string;
  enabled?: boolean;
};

export const useChatSocketConnection = ({
  addKey,
  updateKey,
  deleteKey,
  queryKey,
  paramValue,
  enabled = true,
}: UseChatSocketConnectionProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const handleNewMessage = useCallback(
    (message: MessageWithUser) => {
      queryClient.setQueryData([queryKey, paramValue], (prev: any) => {
        if (!prev?.pages?.length) return prev;

        const exists = prev.pages.some((page: any) =>
          page.data.some((msg: MessageWithUser) => msg.id === message.id)
        );
        if (exists) return prev;

        const newPages = [
          {
            ...prev.pages[0],
            data: [message, ...prev.pages[0].data],
          },
          ...prev.pages.slice(1),
        ];

        return { ...prev, pages: newPages };
      });
    },
    [queryClient, queryKey, paramValue]
  );

  const handleUpdateMessage = useCallback(
    (message: MessageWithUser) => {
      queryClient.setQueryData([queryKey, paramValue], (prev: any) => {
        if (!prev?.pages?.length) return prev;

        const newPages = prev.pages.map((page: any) => ({
          ...page,
          data: page.data.map((msg: MessageWithUser) =>
            msg.id === message.id ? { ...msg, ...message } : msg
          ),
        }));

        return { ...prev, pages: newPages };
      });
    },
    [queryClient, queryKey, paramValue]
  );

  const handleDeleteMessage = useCallback(
    ({ messageId }: { messageId: string }) => {
      queryClient.setQueryData([queryKey, paramValue], (prev: any) => {
        if (!prev?.pages?.length) return prev;

        const newPages = prev.pages.map((page: any) => ({
          ...page,
          data: page.data.filter(
            (msg: MessageWithUser) => msg.id !== messageId
          ),
        }));

        // ✅ Ensure React Query triggers a re-render
        return { ...prev, pages: [...newPages] };
      });
    },
    [queryClient, queryKey, paramValue]
  );

  useEffect(() => {
    if (!socket || !enabled) return;

    console.log('✅ Chat socket listeners ready:', {
      addKey,
      updateKey,
      deleteKey,
    });

    socket.on(addKey, handleNewMessage);
    socket.on(updateKey, handleUpdateMessage);
    socket.on(deleteKey, handleDeleteMessage);

    return () => {
      socket.off(addKey, handleNewMessage);
      socket.off(updateKey, handleUpdateMessage);
      socket.off(deleteKey, handleDeleteMessage);
    };
  }, [
    socket,
    enabled,
    addKey,
    updateKey,
    deleteKey,
    handleNewMessage,
    handleUpdateMessage,
    handleDeleteMessage,
  ]);
};
