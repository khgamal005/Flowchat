import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/providers/web-socket";
import { MessageWithUser } from "@/types/app";

type UseChatSocketConnectionProps = {
  addKey: string;      // e.g. `message:added:${channelId}`
  updateKey: string;   // e.g. `message:updated:${channelId}` (used for both edit & delete)
  queryKey: string;    // e.g. "messages"
  paramValue: string;  // e.g. channelId
};

export const useChatSocketConnection = ({
  addKey,
  updateKey,
  queryKey,
  paramValue,
}: UseChatSocketConnectionProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  /** 🟢 Handle new message */
  const handleNewMessage = useCallback(
    (message: MessageWithUser) => {
      queryClient.setQueryData([queryKey, paramValue], (prev: any) => {
        if (!prev?.pages?.length) return prev;

        const exists = prev.pages.some((page: any) =>
          page.data.some((msg: MessageWithUser) => msg.id === message.id)
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

  /** 🟠 Handle updated/deleted message (same event) */
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

        return { ...prev, pages: updatedPages };
      });
    },
    [queryClient, queryKey, paramValue]
  );

  /** ⚙️ Socket listeners */
  useEffect(() => {
    if (!socket) return;

    console.log("✅ Chat socket active:", { addKey, updateKey });

    socket.on(addKey, handleNewMessage);
    socket.on(updateKey, handleUpdateMessage);

    return () => {
      socket.off(addKey, handleNewMessage);
      socket.off(updateKey, handleUpdateMessage);
    };
  }, [socket, addKey, updateKey, handleNewMessage, handleUpdateMessage]);
};
