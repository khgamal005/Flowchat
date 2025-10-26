'use client';

import { ElementRef, FC, useRef } from 'react';
import { format } from 'date-fns';
import { Channel, User, Workspace } from '@/types/app';
import { useChatFetcher } from '@/hooks/use-chat-fetcher';
import { useChatSocketConnection } from '@/hooks/use-chat-socket-connection';
import { useChatScrollHandler } from '@/hooks/use-chat-scroll-handler';
import { Button } from '@/components/ui/button';
import DotAnimatedLoader from '@/components/dot-animated-loader';
import ChatItem from '@/components/chat-item';
import IntroBanner from '@/components/intro-banner';

const DATE_FORMAT = 'd MMM yyyy, HH:mm';

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
  const chatRef = useRef<ElementRef<'div'>>(null);
  const bottomRef = useRef<ElementRef<'div'>>(null);

  const queryKey =
    type === 'Channel' ? `channel:${chatId}` : `direct:${chatId}`;

  // ✅ Fetch paginated chat messages
  const {
    data,
    status,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatFetcher({
    apiUrl,
    queryKey,
    pageSize: 10,
    paramKey,
    paramValue,
  });

  // ✅ Real-time socket updates
useChatSocketConnection({
  queryKey,
  addKey: type === 'Channel' ? 'channel:message:new' : 'direct:message:new',
  updateKey: type === 'Channel' ? 'channel:message:update' : 'direct:message:update',
  deleteKey: type === 'Channel' ? 'channel:message:delete' : 'direct:message:delete',
  paramValue,
});


  const allMessages = data?.pages?.flatMap((page) => page.data || []) || [];

  useChatScrollHandler({
    chatRef,
    bottomRef,
    count: allMessages.length,
  });

  if (status === 'pending') return <DotAnimatedLoader />;
  if (status === 'error') return <div>Error occurred while loading chat.</div>;

return (
  <div
    ref={chatRef}
/* For WebKit browsers */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-thumb {
  background-color: #6b7280; /* gray-500 */
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af; /* gray-400 */
}

::-webkit-scrollbar-track {
  background: transparent;
}
  >
    {!hasNextPage && (
      <IntroBanner
        type={type}
        name={name}
        creationDate={channelData?.created_at}
      />
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
      {allMessages.map((message) => (
        <ChatItem
          key={message.id}
          id={message.id}
          currentUser={userData}
          user={message.user}
          content={message.content}
          fileUrl={message.file_url}
          deleted={message.is_deleted}
          timestamp={format(new Date(message.created_at), DATE_FORMAT)}
          isUpdated={message.updated_at !== message.created_at}
          socketUrl={socketUrl}
          socketQuery={socketQuery}
          channelData={channelData}
          type={type}
        />
      ))}
    </div>

    <div ref={bottomRef} />
  </div>
);

};

export default ChatMessages;
