'use client';

import { FC, useEffect, useState } from 'react';
import { Channel, User } from '@/types/app';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Typography from '@/components/ui/typography';
import { MdOutlineAdminPanelSettings, MdOutlineAssistantPhoto } from 'react-icons/md';
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
  content: z.string().min(1, 'Message cannot be empty'),
});

const ChatItem: FC<ChatItemProps> = ({
  id,
  content,
  user,
  timestamp,
  fileUrl,
  deleted,
  currentUser,
  isUpdated,
  socketUrl,
  socketQuery,
  channelData,
  type,
}) => {
  const { publicUrl, fileType } = useChatFile(fileUrl ?? '');
  const { socket } = useSocket();
  const [isEditing, setIsEditing] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { content: content ?? '' },
  });

  const isOwner = currentUser.id === user.id;
  const isSuperAdmin = currentUser.id === channelData?.user_id;
  const isRegulator = channelData?.regulators?.includes(currentUser.id) ?? false;
  const canDeleteMessage = !deleted && (isOwner || isSuperAdmin || isRegulator);
  const canEditMessage = !deleted && isOwner && !fileUrl;
  const isPdf = fileType === 'pdf' && fileUrl;
  const isImage = fileType === 'image' && fileUrl;
  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    form.reset({ content: content ?? '' });
  }, [content, form]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsEditing(false);
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

      const eventKey =
        type === 'Channel'
          ? 'channel:message:update'
          : 'direct:message:update';
      socket?.emit(eventKey, { id, content });
    } catch (err) {
      console.error('❌ Failed to edit message:', err);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const url = `${socketUrl}/${id}?${new URLSearchParams(socketQuery)}`;
      await axios.delete(url);

      const deleteKey =
        type === 'Channel'
          ? 'channel:message:delete'
          : 'direct:message:delete';
      socket?.emit(deleteKey, { messageId: id });

      setIsDeleting(false);
      setOpenDeleteDialog(false);
    } catch (err) {
      console.error('❌ Failed to delete message:', err);
      setIsDeleting(false);
    }
  };

  const FilePreview = () => {
    if (!fileUrl) return null;
    if (isImage)
      return (
        <Link
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-28 w-48"
        >
          <Image src={publicUrl} alt="Image" fill className="object-cover" />
        </Link>
      );
    if (isPdf)
      return (
        <div className="flex flex-col gap-2 px-2 py-1 border rounded-md shadow bg-white dark:bg-gray-800">
          <Typography variant="p" text="shared a file" />
          <Link
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View PDF
          </Link>
        </div>
      );
    return null;
  };

  const EditableContent = () =>
    isEditing ? (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="pt-2">
          <fieldset
            className="flex items-center w-full gap-x-2"
            disabled={isLoading}
          >
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      className="p-2 bg-transparent border-none focus-visible:ring-0"
                      placeholder="Edit message..."
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button size="sm" disabled={isLoading}>
              Save
            </Button>
          </fieldset>
        </form>
        <span className="text-[10px]">Press ESC to cancel</span>
      </Form>
    ) : (
      <div
        className={cn('text-sm', { 'text-xs opacity-70 italic': deleted })}
        dangerouslySetInnerHTML={{ __html: content ?? '' }}
      />
    );

  const DeleteDialog = () => (
    <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
      <DialogTrigger asChild>
        <Trash size={20} className="cursor-pointer" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Message</DialogTitle>
          <DialogDescription>
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="text-center mt-2">
          {fileUrl ? <FilePreview /> : <p>{content}</p>}
        </div>

        <div className="flex flex-col gap-2 mt-3">
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            variant="secondary"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="destructive"
            disabled={isDeleting}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="relative group flex items-center hover:bg-black/5 px-1 py-2 rounded transition w-full">
      <div className="flex gap-x-2 w-full">
        <Avatar>
          <AvatarImage src={user.avatar_url} alt={user.name ?? 'U'} />
          <AvatarFallback className="bg-neutral-700">
            {user.name?.slice(0, 2).toUpperCase() ?? 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <Typography
              variant="p"
              text={user.name ?? user.email}
              className="font-semibold text-sm"
            />
            {isSuperAdmin && <MdOutlineAdminPanelSettings className="w-5 h-5" />}
            {isRegulator && <MdOutlineAssistantPhoto className="w-5 h-5" />}
            {isUpdated && !deleted && (
              <span className="text-xs opacity-70">(edited)</span>
            )}
            <span className="text-xs opacity-70">{timestamp}</span>
          </div>

          <FilePreview />
          {!fileUrl && <EditableContent />}
        </div>
      </div>

      {canDeleteMessage && (
        <div className="hidden absolute group-hover:flex gap-2 bg-white dark:bg-black dark:text-white border rounded-md p-2 top-0 right-0 -translate-y-1/3">
          <DeleteDialog />
          {canEditMessage && (
            <Edit
              size={20}
              className="cursor-pointer"
              onClick={() => setIsEditing(true)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ChatItem;
