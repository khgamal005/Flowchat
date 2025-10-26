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

  /** 🟢 Handle new message */
  const handleNewMessage = useCallback(
    (message: MessageWithUser) => {
      queryClient.setQueryData([queryKey, paramValue], (prev: any) => {
        if (!prev?.pages?.length) return prev;

        const alreadyExists = prev.pages.some((page: any) =>
          page.data.some((msg: MessageWithUser) => msg.id === message.id)
        );
        if (alreadyExists) return prev;

        const updatedPages = [
          {
            ...prev.pages[0],
            data: [message, ...prev.pages[0].data],
          },
          ...prev.pages.slice(1),
        ];

        return { ...prev, pages: [...updatedPages] }; // ✅ force new ref
      });

      // 🔄 Force re-render fallback
      queryClient.invalidateQueries({ queryKey: [queryKey, paramValue] });
    },
    [queryClient, queryKey, paramValue]
  );

  /** 🟠 Handle message update */
  const handleUpdateMessage = useCallback(
    (message: MessageWithUser) => {
      queryClient.setQueryData([queryKey, paramValue], (prev: any) => {
        if (!prev?.pages?.length) return prev;

        const updatedPages = prev.pages.map((page: any) => ({
          ...page,
          data: page.data.map((msg: MessageWithUser) =>
            msg.id === message.id ? { ...msg, ...message } : msg
          ),
        }));

        return { ...prev, pages: [...updatedPages] };
      });
    },
    [queryClient, queryKey, paramValue]
  );

  /** 🔴 Handle message delete */
  const handleDeleteMessage = useCallback(
    ({ messageId }: { messageId: string }) => {
      queryClient.setQueryData([queryKey, paramValue], (prev: any) => {
        if (!prev?.pages?.length) return prev;

        const updatedPages = prev.pages.map((page: any) => ({
          ...page,
          data: page.data.filter(
            (msg: MessageWithUser) => msg.id !== messageId
          ),
        }));

        return { ...prev, pages: [...updatedPages] }; // ✅ always new ref
      });

      // 🔄 Force re-render fallback
      queryClient.invalidateQueries({ queryKey: [queryKey, paramValue] });
    },
    [queryClient, queryKey, paramValue]
  );

  /** ⚙️ Register listeners */
  useEffect(() => {
    if (!socket || !enabled) return;

    console.log('✅ Socket listeners active:', { addKey, updateKey, deleteKey });

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
