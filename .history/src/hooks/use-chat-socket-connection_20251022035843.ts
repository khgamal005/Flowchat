import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { useSocket } from '@/providers/web-socket';
import { MessageWithUser } from '@/types/app';

type UseChatSocketConnectionProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
  paramValue: string;
  enabled?: boolean; // Add this to control when the hook is active
};

export const useChatSocketConnection = ({
  addKey,
  updateKey,
  queryKey,
  paramValue,
  enabled = true, // Default to enabled
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
      // Only add if it's not already in the list (avoid duplicates)
      queryClient.setQueryData([queryKey, paramValue], (prev: any) => {
        if (!prev?.pages?.length) return prev;

        // Check if message already exists to avoid duplicates
        const existingMessage = prev.pages[0].data.find(
          (msg: MessageWithUser) => msg.id === message.id
        );
        
        if (existingMessage) {
          return prev; // Message already exists, don't add again
        }

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
    if (!socket || !enabled) return;

    socket.on(updateKey, handleUpdateMessage);
    socket.on(addKey, handleNewMessage);

    // Cleanup
    return () => {
      socket.off(updateKey, handleUpdateMessage);
      socket.off(addKey, handleNewMessage);
    };
  }, [socket, updateKey, addKey, handleUpdateMessage, handleNewMessage, enabled]);
};