'use client';

import { FiPlus } from 'react-icons/fi';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import PlaceHolder from '@tiptap/extension-placeholder';
import { FC, useState } from 'react';
import { Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import MenuBar from '@/components/menu-bar';
import ChatFileUpload from '@/components/chat-file-upload';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Channel, User, Workspace, MessageWithUser } from '@/types/app';
import { useSocket } from '@/providers/web-socket';
import { useChatSocketConnection } from '@/hooks/use-chat-socket-connection';

type TextEditorProps = {
  apiUrl: string;
  type: 'Channel' | 'DirectMessage';
  channel?: Channel;
  workspaceData: Workspace;
  userData: User;
  recipientId?: string;
  onMessageSent?: (message: MessageWithUser) => void;
};
console.log(socket);
const TextEditor: FC<TextEditorProps> = ({
  apiUrl,
  type,
  channel,
  workspaceData,
  userData,
  recipientId,
  onMessageSent,
}) => {
  const [content, setContent] = useState('');
  const [fileUploadModal, setFileUploadModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { socket } = useSocket();
  const router = useRouter();
  const queryClient = useQueryClient();

  const chatId = type === 'Channel' ? channel?.id : recipientId;
  const queryKey = type === 'Channel' ? `channel:${chatId}` : `direct_message:${chatId}`;

  // ✅ Subscribe to real-time socket updates too (same key)


  const toggleFileUploadModal = () => setFileUploadModal(prev => !prev);

  const editor = useEditor({
    extensions: [
      StarterKit,
      PlaceHolder.configure({
        placeholder: `Message #${channel?.name ?? 'USERNAME'}`,
      }),
    ],
    autofocus: true,
    content,
    immediatelyRender: false,
    onUpdate({ editor }) {
      setContent(editor.getHTML());
    },
  });

  const handleSend = async () => {
    if (content.trim().length < 1 || isSending) return;
    setIsSending(true);

    try {
      const payload = { content, type };
      let endpoint = apiUrl;

      if (type === 'Channel' && channel) {
        endpoint += `?channelId=${channel.id}&workspaceId=${workspaceData.id}`;
      } else if (type === 'DirectMessage' && recipientId) {
        endpoint += `?recipientId=${recipientId}&workspaceId=${workspaceData.id}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (response.status === 401) {
        router.push('/auth');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const newMessage = result.data;

      // ✅ Optimistic UI update (same key signature)
      // queryClient.setQueryData([queryKey, chatId], (prev: any) => {
      //   if (!prev?.pages?.length) return prev;
      //   const updatedPages = [...prev.pages];
      //   updatedPages[0] = {
      //     ...updatedPages[0],
      //     data: [newMessage, ...updatedPages[0].data],
      //   };
      //   return { ...prev, pages: updatedPages };
      // });

      // ✅ Clear editor
      setContent('');
      editor?.commands.setContent('');

      // ✅ Emit socket event
      const addKey =
        type === 'Channel'
          ? `${queryKey}:channel-messages`
          : `direct_messages:post`;

      if (socket && newMessage) {
        socket.emit(addKey, newMessage);
      }

      // ✅ Callback
      if (onMessageSent) {
        onMessageSent(newMessage);
      }
    } catch (error) {
      console.error('SEND MESSAGE ERROR:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className='p-1 border dark:border-zinc-500 border-neutral-700 rounded-md relative overflow-hidden'>
      <div className='sticky top-0 z-10'>{editor && <MenuBar editor={editor} />}</div>

      <div className='h-[150px] pt-11 flex w-full grow-1'>
        <EditorContent
          className='prose w-full h-[150px] dark:text-white leading-normal overflow-y-auto whitespace-pre-wrap'
          editor={editor}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div
        className='absolute top-3 z-10 right-3 bg-black dark:bg-white cursor-pointer transition-all duration-500 hover:scale-110 text-white grid place-content-center rounded-full w-6 h-6'
        onClick={toggleFileUploadModal}
      >
        <FiPlus size={28} className='dark:text-black' />
      </div>

      <Button
        onClick={handleSend}
        disabled={content.length < 1 || isSending}
        size='sm'
        className='absolute bottom-1 right-1'
      >
        {isSending ? 'Sending...' : <Send />}
      </Button>

      <Dialog onOpenChange={toggleFileUploadModal} open={fileUploadModal}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>File Upload</DialogTitle>
            <DialogDescription>
              Upload a file to share with your team
            </DialogDescription>
          </DialogHeader>

          <ChatFileUpload
            userData={userData}
            workspaceData={workspaceData}
            channel={channel}
            recipientId={recipientId}
            toggleFileUploadModal={toggleFileUploadModal}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TextEditor;
