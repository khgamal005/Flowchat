"use client";

import { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { Send } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

import { Button } from "@/components/ui/button";
import MenuBar from "@/components/menu-bar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import ChatFileUpload from "@/components/chat-file-upload";
import { Channel, User, Workspace, MessageWithUser } from "@/types/app";

type TextEditorProps = {
  apiUrl: string;
  type: "Channel" | "DirectMessage";
  channel?: Channel;
  workspaceData: Workspace;
  userData: User;
  recipientId?: string;
  onMessageSent?: (message: MessageWithUser) => void;
};

export default function TextEditor({
  apiUrl,
  type,
  channel,
  workspaceData,
  userData,
  recipientId,
  onMessageSent,
}: TextEditorProps) {
  const [content, setContent] = useState("");
  const [fileUploadModal, setFileUploadModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  // ✅ Hook 1: Editor (must always be called)
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: `Message #${channel?.name ?? "username"}`,
      }),
    ],
    autofocus: true,
    content,
    immediatelyRender: false, // ✅ Important for Next.js SSR
    onUpdate: ({ editor }) => setContent(editor.getHTML()),
  });

  const toggleFileUploadModal = () => setFileUploadModal((p) => !p);

  const handleSend = async () => {
    if (content.trim().length < 1 || isSending) return;
    setIsSending(true);

    try {
      const payload = { content, type };
      let endpoint = apiUrl;

      if (type === "Channel" && channel) {
        endpoint += `?channelId=${channel.id}&workspaceId=${workspaceData.id}`;
      } else if (type === "DirectMessage" && recipientId) {
        endpoint += `?recipientId=${recipientId}&workspaceId=${workspaceData.id}`;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
      const result = await response.json();

      // Clear editor
      setContent("");
      editor?.commands.setContent("");

      // Emit socket event
      if (socket) {
        const addEvent =
          type === "Channel"
            ? `channel:${channel?.id}:new_message`
            : `dm:${recipientId}:new_message`;
        socket.emit(addEvent, result.data);
      }

      // Parent callback
      onMessageSent?.(result.data);
    } catch (error) {
      console.error("SEND MESSAGE ERROR:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-1 border dark:border-zinc-500 border-neutral-700 rounded-md relative overflow-hidden">
      <div className="sticky top-0 z-10">
        {editor && <MenuBar editor={editor} />}
      </div>
      <div className="h-[150px] pt-11 flex w-full grow-1">
        <EditorContent
          className="prose w-full h-[150px] dark:text-white leading-normal overflow-y-auto whitespace-pre-wrap"
          editor={editor}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div
        onClick={toggleFileUploadModal}
        className="absolute top-3 z-10 right-3 bg-black dark:bg-white cursor-pointer transition-all duration-500 hover:scale-110 text-white grid place-content-center rounded-full w-6 h-6"
      >
        <FiPlus size={28} className="dark:text-black" />
      </div>

      <Button
        onClick={handleSend}
        disabled={content.length < 1 || isSending}
        size="sm"
        className="absolute bottom-1 right-1"
      >
        {isSending ? "Sending..." : <Send />}
      </Button>

      <Dialog onOpenChange={toggleFileUploadModal} open={fileUploadModal}>
        <DialogContent className="sm:max-w-md">
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
}
