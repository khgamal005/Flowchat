'use client';

import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { v4 as uuid } from 'uuid';
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { File } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/supabase/supabaseClient";
import { Channel, User, Workspace } from '@/types/app';
import Typography from "./ui/typography";

type ChatFileUploadProps = {
  userData: User;
  workspaceData: Workspace;
  channel?: Channel;
  recipientId?: string;
  toggleFileUploadModal: () => void;
};

const formSchema = z.object({
  file: z
    .any()
    .refine((val) => val && val.length > 0, "File is required")
    .refine(
      (val) => {
        const file = val?.[0];
        return file?.type?.startsWith("image/") || file?.type === "application/pdf";
      },
      "Only images or PDFs are allowed"
    ),
});

const ChatFileUpload: FC<ChatFileUploadProps> = ({
  channel,
  userData,
  workspaceData,
  recipientId,
  toggleFileUploadModal,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { file: undefined },
  });

  const fileRef = form.register("file");

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("🟢 Form values received:", values);

    const uniqueId = uuid();
    const file = values.file?.[0];
    if (!file) return;

    const supabase = createClient();

    let fileTypePrefix = '';
    if (file.type === 'application/pdf') {
      fileTypePrefix = 'pdf';
    } else if (file.type.startsWith('image/')) {
      fileTypePrefix = 'img';
    }

    const fileName = `chat/${fileTypePrefix}-${uniqueId}`;

    const { data, error } = await supabase.storage
      .from('chat-files')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) {
      console.log('Error uploading file', error);
      toast.error('Upload failed');
      return;
    }
        let messageInsertError;
          if (recipientId) {
      const { data: diretMessageData, error: dmError } = await supabase
        .from("direct_messages")
        .insert({
          file_url: data.path,
          user: userData.id,
          user_one: userData.id,
          user_two: recipientId,
        });

      messageInsertError = dmError;

      else {
        
        const { data: messageData, error: messageInsertError } = await supabase
         .from("messages")
         .insert({
           file_url: data.path,
           user_id: userData.id,
           channel_id: channel?.id,
           workspace_id: workspaceData.id,
         });
         
      }


    //        if (messageInsertError) {
    //   console.log("Error inserting message", messageInsertError);
    //   return { error: messageInsertError.message };
    // }

    // just logging — no upload yet
    setIsUploading(false);
    toggleFileUploadModal();
    toast.success("File uploaded successfully");
    form.reset();
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="border border-dashed border-gray-300 rounded-lg flex flex-col gap-2 p-6 items-center">
          <File className="w-12 h-12 text-gray-400" />
          <Typography text="Select your file" variant="p" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*,application/pdf"
                      {...fileRef}
                      onChange={(e) => field.onChange(e.target.files)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isUploading} className="w-full">
              <Typography text={isUploading ? "Uploading..." : "Submit"} variant="p" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ChatFileUpload;
