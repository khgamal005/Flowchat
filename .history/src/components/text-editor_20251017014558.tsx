"use client";

import { FiPlus } from "react-icons/fi";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useState, useEffect, FC } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import MenuBar from "@/components/menu-bar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Channel, User, Workspace } from "@/types/app";
import axios from "axios";
import ChatFileUpload from "./chat-file-upload";

type TextEditorProps = {
  apiUrl: string;
  type: "Channel" | "DirectMessage";
  channel?: Channel;
  workspaceData: Workspace;
  userData: User;
};

const TextEditor: FC<TextEditorProps> = ({
  apiUrl,
  channel,
  workspaceData,
  userData,
}) => {
  const [content, setContent] = useState("");
  const [fileUploadModal, setFileUploadModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: `Message #${channel?.name ?? "USERNAME"}`,
      }),
    ],
    autofocus: true,
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => setContent(editor.getHTML()),
  });

  if (!isMounted) return <div className="h-[150px] p-2 border rounded-md" />;

  const handleSend = async () => {
    if (content.length < 2) return;
    try {
      await axios.post(
        `${apiUrl}?channelId=${channel?.id}&workspaceId=${workspaceData.id}`,
        { content },
        { withCredentials: true }
      );
      setContent("");
      editor?.commands.setContent("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-1 border dark:border-zinc-500 border-neutral-700 rounded-md relative overflow-hidden">
      <div className="sticky top-0 z-10">{editor && <MenuBar editor={editor} />}</div>

      <div className="h-[150px] pt-11 flex w-full">
        <EditorContent
          className="prose w-full h-[150px] dark:text-white leading-[1.15px] overflow-y-hidden whitespace-pre-wrap"
          editor={editor}
        />
      </div>

      {/* Open file upload modal */}
      <div
        onClick={() => setFileUploadModal(true)}
        className="absolute top-3 z-10 right-3 bg-black dark:bg-white cursor-pointer transition-all duration-500 hover:scale-110 text-white grid place-content-center rounded-full w-6 h-6"
      >
        <FiPlus size={28} className="dark:text-black" />
      </div>

      <Button
        onClick={handleSend}
        disabled={content.length < 2}
        size="sm"
        className="absolute bottom-1 right-1"
      >
        <Send />
      </Button>

      <Dialog open={fileUploadModal} onOpenChange={setFileUploadModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>File Upload</DialogTitle>
            <DialogDescription>Upload a file to share with your team</DialogDescription>
          </DialogHeader>

          <ChatFileUpload
            userData={userData}
            workspaceData={workspaceData}
            channel={channel}
            recipientId={recipientId}
            toggleFileUploadModal={() => setFileUploadModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TextEditor;
