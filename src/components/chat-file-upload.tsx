'use client';

import { FC, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "sonner";
import { Channel, User, Workspace } from '@/types/app';

type ChatFileUploadProps = {
  userData: User;
  workspaceData: Workspace;
  channel?: Channel;
  recipientId?: string;
  toggleFileUploadModal: () => void;
};

const ChatFileUpload: FC<ChatFileUploadProps> = ({
  channel,
  userData,
  workspaceData,
  recipientId,
  toggleFileUploadModal,
}) => {
  const [file, setFile] = useState<File | null>(null);

  const { startUpload, isUploading } = useUploadThing("chatFile", {
    onUploadError: () => {
      toast.error("Upload failed");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const allowed = selected.type.startsWith("image/") || selected.type === "application/pdf";
    if (!allowed) {
      toast.error("Only images or PDFs are allowed");
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const uploadResult = await startUpload([file]);
    if (!uploadResult?.[0]?.url) {
      toast.error("Upload failed");
      return;
    }

    const fileUrl = uploadResult[0].url;

    const response = await fetch('/api/upload-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileUrl,
        channelId: channel?.id || '',
        workspaceId: workspaceData.id,
        recipientId: recipientId || '',
        userId: userData.id,
      }),
    });

    if (!response.ok) {
      toast.error("Failed to save message");
      return;
    }

    toggleFileUploadModal();
    toast.success("File uploaded successfully");
    setFile(null);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      <button
        type="submit"
        disabled={!file || isUploading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md disabled:opacity-50"
      >
        {isUploading ? "Uploading..." : "Submit"}
      </button>
    </form>
  );
};

export default ChatFileUpload;
