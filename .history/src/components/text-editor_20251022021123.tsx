// components/text-editor.tsx - UPDATED
'use client';

import { FiPlus } from 'react-icons/fi';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { FC, useState } from 'react';
import PlaceHolder from '@tiptap/extension-placeholder';
import { Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import MenuBar from '@/components/menu-bar';
import { Channel, User, Workspace } from '@/types/app';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from '@/components/ui/dialog';
import { DialogTitle } from '@radix-ui/react-dialog';
import ChatFileUpload from '@/components/chat-file-upload';


type TextEditorProps = {
  apiUrl: string;
  type: 'Channel' | 'DirectMessage';
  channel?: Channel;
  workspaceData: Workspace;
  userData: User;
  recipientId?: string;
};

const TextEditor: FC<TextEditorProps> = ({
  apiUrl,
  type,
  channel,
  workspaceData,
  userData,
  recipientId,
}) => {
  const [content, setContent] = useState('');
  const [fileUploadModal, setFileUploadModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();

  const toggleFileUploadModal = () => setFileUploadModal(prevState => !prevState);

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
      // Verify session before sending
      const supabase = createClien();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.refresh(); // Trigger middleware re-auth
        throw new Error('No active session');
      }

      const payload = { content, type };
      let endpoint = apiUrl;

      if (type === 'Channel' && channel) {
        endpoint += `?channelId=${channel.id}&workspaceId=${workspaceData.id}`;
      } else if (type === 'DirectMessage' && recipientId) {
        endpoint += `?recipientId=${recipientId}&workspaceId=${workspaceData.id}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include', // Important for cookies
      });

      if (response.status === 401) {
        // Session expired, redirect to login
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Clear editor on success
      setContent('');
      editor?.commands.setContent('');
      
      // Refresh to show new message
      router.refresh();

    } catch (error) {
      console.error('SEND MESSAGE ERROR:', error);
      // Optionally show error to user
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
      <div className='sticky top-0 z-10'>
        {editor && <MenuBar editor={editor} />}
      </div>
      <div className='h-[150px] pt-11 flex w-full grow-1'>
        <EditorContent
          className="prose w-full h-[150px] dark:text-white leading-normal overflow-y-auto whitespace-pre-wrap"
          editor={editor}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className='absolute top-3 z-10 right-3 bg-black dark:bg-white cursor-pointer transition-all duration-500 hover:scale-110 text-white grid place-content-center rounded-full w-6 h-6'>
        <FiPlus
          onClick={toggleFileUploadModal}
          size={28}
          className='dark:text-black'
        />
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