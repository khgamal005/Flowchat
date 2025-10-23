export const useChatSocketConnection = ({
  addKey,
  updateKey,
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

        const existingMessage = prev.pages[0].data.find(
          (msg: MessageWithUser) => msg.id === message.id
        );
        
        if (existingMessage) {
          return prev;
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

  // NEW: Handle the 'message' event with the structure your TextEditor emits
  const handleMessageEvent = useCallback(
    (data: { type: string; channelId: string; message: MessageWithUser }) => {
      console.log('Received message event:', data);
      
      // Check if this is a new_message event for the current channel
      if (data.type === 'new_message' && data.channelId === paramValue) {
        console.log('Adding new message via message event');
        handleNewMessage(data.message);
      }
    },
    [handleNewMessage, paramValue]
  );

  useEffec(() => {
    if (!socket || !enabled) return;

    // Listen for both event types
    socket.on(updateKey, handleUpdateMessage);
    socket.on(addKey, handleNewMessage);
    
    // ADD THIS: Listen for the 'message' event that TextEditor actually emits
    socket.on('message', handleMessageEvent);

    // Cleanup
    return () => {
      socket.off(updateKey, handleUpdateMessage);
      socket.off(addKey, handleNewMessage);
      socket.off('message', handleMessageEvent);
    };
  }, [socket, updateKey, addKey, handleUpdateMessage, handleNewMessage, handleMessageEvent, enabled]);
};