"use client"

import { ElementRef, FC, useRef, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useChatFetcher } from './use-chat-fetcher';

// ... your imports

const ChatMessages: FC<ChatMessagesProps> = ({
  // ... your props
}) => {
  const chatRef = useRef<ElementRef<'div'>>(null);
  const bottomRef = useRef<ElementRef<'div'>>(null);
  const [authError, setAuthError] = useState(false);

  const queryKey =
    type === 'Channel' ? `channel:${chatId}` : `direct_message:${chatId}`;

  const { data, status, fetchNextPage, hasNextPage, isFetchingNextPage, error } =
    useChatFetcher({
      apiUrl,
      queryKey,
      pageSize: 10,
      paramKey,
      paramValue,
    });

  // Monitor for authentication errors
  useEffect(() => {
    if (error && (error as any)?.response?.status === 401) {
      setAuthError(true);
    }
  }, [error]);

  useChatSocketConnection({
    queryKey,
    addKey:
      type === 'Channel'
        ? `${queryKey}:channel-messages`
        : `direct_messages:post`,
    updateKey:
      type === 'Channel'
        ? `${queryKey}:channel-messaegs:update`
        : `direct_messages:update`,
    paramValue,
  });

  useChatScrollHandler({
    chatRef,
    bottomRef,
    count: data?.pages?.[0].data?.length ?? 0,
  });

  if (authError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Authentication Error</h3>
          <p className="text-muted-foreground">Please refresh the page</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // ... rest of your component
};