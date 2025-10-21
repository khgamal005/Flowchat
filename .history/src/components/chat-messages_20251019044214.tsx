'use client';

import { FC, useRef, useEffect, useState } from 'react';
import { format } from 'date-fns';

import { Channel, User, Workspace } from '@/types/app';
import DotAnimatedLoader from '@/components/dot-animated-loader';
import IntroBanner from '@/components/intro-banner';
import { Button } from '@/components/ui/button';
import { useChatFetcher } from '@/hooks/use-chat-fetcher';
import { useChatScrollHandler } from '@/hooks/use-chat-scroll-handler';
import { useChatSocketConnection } from '@/hooks/use-chat-socket-connection';
import ChatItem from './chat-item';

const DATE_FORMAT = 'd MMM yyy, HH:mm';

type ChatMessagesProps = {
  userData: User;
  name: string;
  chatId: string;
  apiUrl: string;
  socketUrl: string;
  socketQuery: Record<string, string>;
  paramKey: 'channelId' | 'recipientId';
  paramValue: string;
  type: 'Channel' | 'DirectMessage';
  workspaceData: Workspace;
  channelData?: Channel;
};
export type UseChatScrollHandlerProps = {
  chatRef: RefObject<HTMLDivElement | null>;
  bottomRef: RefObject<HTMLDivElement | null>;
  count: number;
};

const ChatMessages: FC<ChatMessagesProps> = ({
  apiUrl,
  chatId,
  name,
  paramKey,
  paramValue,
  socketQuery,
  socketUrl,
  type,
  userData,
  workspaceData,
  channelData,
}) => {
  const chatRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [authError, setAuthError] = useState(false);

  const queryKey = type === 'Channel' ? `channel:${chatId}` : `direct_message:${chatId}`;

  const {
    data,
    status,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
  } = useChatFetcher({
    apiUrl,
    queryKey,
    pageSize: 10,
    paramKey,
    paramValue,
  });

  useEffect(() => {
    if (error && (error as any)?.response?.status === 401) {
      setAuthError(true);
    }
  }, [error]);

  useChatSocketConnection({
    queryKey,
    addKey: type === 'Channel' ? `${queryKey}:channel-messages` : `direct_messages:post`,
    updateKey: type === 'Channel' ? `${queryKey}:channel-messages:update` : `direct_messages:update`,
    paramValue,
  });

useChatScrollHandler({
  chatRef: chatRef as React.RefObject<HTMLDivElement>,
  bottomRef: bottomRef as React.RefObject<HTMLDivElement>,
  count: data?.pages?.[0]?.data?.length ?? 0,
});
  if (authError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Authentication Error</h3>
          <p className="text-muted-foreground">Please refresh the page</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'pending') return <DotAnimatedLoader />;
  if (status === 'error') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Error Occurred</h3>
          <p className="text-muted-foreground">Failed to load messages</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={chatRef} className="flex-1 flex flex-col py-4 overflow-y-auto">
      {!hasNextPage && (
        <IntroBanner type={type} name={name} creationDate={channelData?.created_at!} />
      )}
      {hasNextPage && (
        <div className="flex justify-center">
          {isFetchingNextPage ? (
            <DotAnimatedLoader />
          ) : (
            <Button variant="link" onClick={() => fetchNextPage()}>
              Load Previous Messages
            </Button>
          )}
        </div>
      )}
      <div className="flex flex-col-reverse mt-auto">
        {data?.pages.map((page) =>
          page.data.map((message) => (
            <ChatItem
              key={message.id}
              currentUser={userData}
              user={message.user}
              content={message.content}
              fileUrl={message.file_url}
              deleted={message.is_deleted}
              id={message.id}
              timestamp={format(new Date(message.created_at), DATE_FORMAT)}
              isUpdated={message.updated_at !== message.created_at}
              socketUrl={socketUrl}
              socketQuery={socketQuery}
              channelData={channelData}
            />
          ))
        )}
      </div>
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessages;
