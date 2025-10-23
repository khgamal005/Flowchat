'use client';

import { ElementRef, FC, useRef, useState, useEffect } from 'react';
import { format } from 'date-fns';

import { Channel, User, Workspace, MessageWithUser } from '@/types/app';
import { useChatFetcher } from '@/hooks/use-chat-fetcher';
import DotAnimatedLoader from '@/components/dot-animated-loader';
import ChatItem from '@/components/chat-item';
import { useChatSocketConnection } from '@/hooks/use-chat-socket-connection';
import IntroBanner from '@/components/intro-banner';
import { Button } from '@/components/ui/button';
import { useChatScrollHandler } from '@/hooks/use-chat-scroll-handler';
import { useSocket } from '@/providers/web-socket'; // Use shared socket

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
  onNewMessage?: (message: MessageWithUser) => void;
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
  onNewMessage,
}) => {
  const chatRef = useRef<ElementRef<'div'>>(null);
  const bottomRef = useRef<ElementRef<'div'>>(null);
  const { socket } = useSocket(); // Use shared socket from provider
  const [optimisticMessages, setOptimisticMessages] = useState<MessageWithUser[]>([]);

  const queryKey = type === 'Channel' ? `channel:${chatId}` : `direct_message:${chatId}`;

  const { data, status, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useChatFetcher({
      apiUrl,
      queryKey,
      pageSize: 10,
      paramKey,
      paramValue,
    });

  // Use the chat socket connection hook with shared socket
useChatSocketConnection({
  queryKey,
  addKey:
    type === 'Channel'
      ? `${queryKey}:channel-messages`
      : `direct_messages:post`,
  updateKey:
    type === 'Channel'
      ? `${queryKey}:channel-messages:update`
      : `direct_messages:update`,
  paramValue,
});
  // Handle direct messages from parent callback (backup)
  useEffect(() => {
    if (onNewMessage) {
      console.log('Parent callback available for new messages');
    }
  }, [onNewMessage]);

  // Combine fetched messages with optimistic updates
  const allMessages = [
    ...optimisticMessages,
    ...(data?.pages?.flatMap(page => page.data || []) || [])
  ];

  useChatScrollHandler({
    chatRef,
    bottomRef,
    count: allMessages.length,
  });

  if (status === 'pending') {
    return <DotAnimatedLoader />;
  }

  if (status === 'error') {
    return <div>Error Occurred</div>;
  }

  const renderMessages = () =>
    allMessages.map(message => (
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
    ));

  return (
    <div ref={chatRef} className='flex-1 flex flex-col py-4 overflow-y-auto'>
      {!hasNextPage && (
        <IntroBanner
          type={type}
          name={name}
          creationDate={channelData?.created_at}
        />
      )}
      {hasNextPage && (
        <div className='flex justify-center'>
          {isFetchingNextPage ? (
            <DotAnimatedLoader />
          ) : (
            <Button variant='link' onClick={() => fetchNextPage()}>
              Load Previous Messages
            </Button>
          )}
        </div>
      )}
      <div className='flex flex-col-reverse mt-auto'>{renderMessages()}</div>
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessages;