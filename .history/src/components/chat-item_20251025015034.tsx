"use client";

import { FC, useEffect, useState, useCallback } from "react";
import { Channel, User } from "@/types/app";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Typography from "@/components/ui/typography";
import {
  MdOutlineAdminPanelSettings,
  MdOutlineAssistantPhoto,
} from "react-icons/md";
import Link from "next/link";
import Image from "next/image";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Edit, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import axios from "axios";
import { useChatFile } from "@/hooks/use-chat-file";

const formSchema = z.object({
  content: z.string().min(2, "Message must be at least 2 characters."),
});

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
};

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
}) => {
  const { publicUrl, fileType } = useChatFile(fileUrl || "");
  const [isEditing, setIsEditing] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { content: content ?? "" },
  });

  const { handleSubmit, control, reset, formState } = form;

  // Reset form when message content changes
  useEffect(() => {
    reset({ content: content ?? "" });
  }, [content, reset]);

  // Keyboard shortcut to exit edit mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsEditing(false);
        reset({ content: content ?? "" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [content, reset]);

  // const isSuperAdmin = currentUser.id === channelData?.user_id;
  // const isRegulator = channelData?.regulators?.includes(currentUser.id) ?? false;
  const isOwner = currentUser.id === user.id;

  const canDeleteMessage = !deleted && (isOwner );
  const canEditMessage = !deleted && isOwner && !fileUrl;
  console.log("canEditMessage:", isOwner);

  const isPdf = fileType === "pdf" && fileUrl;
  const isImage = fileType === "image" && fileUrl;

  const buildApiUrl = useCallback(() => {
    const params = new URLSearchParams({
      ...socketQuery,
      messageId: id,
      channelId: socketQuery.channelId,
      workspaceId: socketQuery.workspaceId,
    });
    return `${socketUrl}?${params.toString()}`;
  }, [socketQuery, socketUrl, id]);

  const onSubmit = async ({ content }: z.infer<typeof formSchema>) => {
    if (!content.trim()) return;
    try {
      await axios.patch(buildApiUrl(), { content: content.trim() });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update message:", err);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await axios.delete(buildApiUrl());
      setOpenDeleteDialog(false);
    } catch (err) {
      console.error("Failed to delete message:", err);
    } finally {
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
          <Image src={publicUrl} alt="Image" fill className="object-cover" />
        </Link>
      )}
      {isPdf && (
        <div className="flex flex-col items-start gap-2 px-3 py-2 border rounded-md shadow bg-white dark:bg-gray-800 mt-2">
          <Typography
            variant="p"
            text="shared a file"
            className="text-sm font-semibold text-gray-700 dark:text-gray-200"
          />
          <Link
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View PDF
          </Link>
        </div>
      )}
    </>
  );

  const EditableContent = () =>
    isEditing ? (
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full pt-2">
          <fieldset className="flex items-center w-full gap-2" disabled={formState.isSubmitting}>
            <FormField
              control={control}
              name="content"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      {...field}
                      className="p-2 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                      placeholder="Edit message..."
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button size="sm" disabled={formState.isSubmitting}>
              Save
            </Button>
          </fieldset>
          <p className="text-[10px] mt-1 text-gray-500">Press ESC to cancel</p>
        </form>
      </Form>
    ) : (
      <div
        className={cn("text-sm break-words", {
          "text-xs italic opacity-80": deleted,
        })}
        dangerouslySetInnerHTML={{ __html: content ?? "" }}
      />
    );

  const DeleteDialog = () => (
    <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
      <DialogTrigger asChild>
        <Trash size={18} className="cursor-pointer hover:text-red-600" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Message</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the message.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 text-center">
          {fileUrl && (
            <FilePreview />
          )}
          {!fileUrl && content && (
            <div
              className="text-sm italic text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
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
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="relative group flex items-start gap-2 hover:bg-black/5 px-2 py-2 rounded-md transition w-full">
      <Avatar className="mt-1">
        <AvatarImage
          src={user.avatar_url}
          alt={user.name ?? user.email}
          className="object-cover"
        />
        <AvatarFallback className="bg-neutral-700 text-white">
          {user.name?.slice(0, 2)?.toUpperCase() ?? "UN"}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col w-full">
        <div className="flex items-center gap-2">
          <Typography
            variant="p"
            text={user.name ?? user.email}
            className="font-semibold text-sm hover:underline cursor-pointer"
          />
          {/* {isSuperAdmin && <MdOutlineAdminPanelSettings className="w-4 h-4" />}
          {isRegulator && <MdOutlineAssistantPhoto className="w-4 h-4" />} */}
          {isUpdated && !deleted && <span className="text-xs">(edited)</span>}
          <span className="text-xs text-gray-500">{timestamp}</span>
        </div>

        <FilePreview />
        {!fileUrl && <EditableContent />}
      </div>

      {canDeleteMessage && (
        <div className="hidden absolute group-hover:flex gap-2 border bg-white dark:bg-black dark:text-white text-black rounded-md p-2 top-1 right-2 shadow">
          <DeleteDialog />
          {canEditMessage && (
            // <Edit
            //   size={18}
            //   className="cursor-pointer hover:text-blue-600"
            //   onClick={() => setIsEditing(true)}
            // />
          )}
        </div>
      )}
    </div>
  );
};

export default ChatItem;
