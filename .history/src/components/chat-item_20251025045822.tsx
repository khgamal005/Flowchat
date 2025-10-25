'use client';

import { FC, useEffect, useState } from 'react';
import { Channel, User } from '@/types/app';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Typography from '@/components/ui/typography';
import {
  MdOutlineAdminPanelSettings,
  MdOutlineAssistantPhoto,
} from 'react-icons/md';
import { useChatFile } from '@/hooks/use-chat-file';
import Link from 'next/link';
import Image from 'next/image';
import { Form, FormControl, FormField, FormItem } from './ui/form';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Edit, Trash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import axios from 'axios';
import { useSocket } from '@/providers/web-socket';

type ChatItemProps = {
  id: string;
  content: string | null;
  user: User;
  timestamp: string;
  fileUrl: string | null;
  deleted: boolean;
  currentUser: User;
  isUpdated: boolean;
  socketUrl: string;
  socketQuery: Record<string, string>;
  channelData?: Channel;
  type: 'Channel' | 'DirectMessage';
};

const formSchema = z.object({
  content: z.string().min(2),
});

const ChatItem: FC<ChatItemProps> = ({
  content,
  currentUser,
  deleted,
  id,
  isUpdated,
  socketQuery,
  socketUrl,
  timestamp,
  user,
  channelData,
  fileUrl,
  type,
}) => {
  const { publicUrl, fileType } = useChatFile(fileUrl ?? '');
  const [isEditing, setIsEditing] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { socket } = useSocket();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: content ?? '',
    },
  });

  const isSuperAdmin = currentUser.id === channelData?.user_id;
  const isRegulator = channelData?.regulators?.includes(currentUser.id) ?? false;
  const isOwner = currentUser.id === user.id;
  const canDeleteMessage = !deleted && (isOwner || isSuperAdmin || isRegulator);
  const canEditMessage = !deleted && isOwner && !fileUrl;
  const isPdf = fileType === 'pdf' && fileUrl;
  const isImage = fileType === 'image' && fileUrl;
  const isLoading = form.formState.isSubmitting;

  useEffect(() => form.reset({ content: content ?? '' }), [content, form]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsEditing(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const onSubmit = async ({ content }: z.infer<typeof formSchema>) => {
    try {
      const url = `${socketUrl}/${id}?${new URLSearchParams(socketQuery)}`;
      await axios.patch(url, { content });
      setIsEditing(false);
      form.reset();

      // Emit real-time edit event
      const eventKey =
        type === 'Channel'
          ? 'channel:message:edit'
          : 'direct_message:edit';
      socket?.emit(eventKey, { messageId: id, content });
    } catch (error) {
      console.error('❌ Failed to edit message:', error);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const url = `${socketUrl}/${id}?${new URLSearchParams(socketQuery)}`;
      await axios.delete(url);

      // Emit real-time delete event
      const deleteKey =
        type === 'Channel'
          ? 'channel:message:delete'
          : 'direct_message:delete';

      socket?.emit(deleteKey, { messageId: id });
      console.log('🗑️ Emitted delete event:', deleteKey, id);

      setIsDeleting(false);
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('❌ Failed to delete message:', error);
      setIsDeleting(false);
    }
  };

  const FilePreview = () => (
    <>
      {isImage && (
        <Link
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-28 w-48"
        >
          <Image
            src={publicUrl}
            alt={content ?? ''}
            fill
            className="object-cover"
          />
        </Link>
      )}
      {isPdf && (
        <div className="flex flex-col items-start justify-center gap-2 px-2 py-1 border rounded-md shadow bg-white dark:bg-gray-800">
          <Typography
            variant="p"
            text="shared a file"
            className="text-lg font-semibold text-gray-700 dark:text-gray-200"
          />
          <Link
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            View PDF
          </Link>
        </div>
      )}
