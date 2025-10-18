"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useState } from "react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { File } from "lucide-react";
import { Channel, User, Workspace } from "@/types/app";
import { createClient } from "@/supabase/supabaseClient";
import Typography from "./typography";

type ChatFileUploadProps = {
  userData: User;
  workspaceData: Workspace;
  channel?: Channel;
  recipientId?: string;
  toggleFileUploadModal: () => void;
};

const formSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files?.length === 1, "File is required")
    .refine(
      (files) => {
        const file = files?.[0];
        return (
          file?.type === "application/pdf" || file?.type.startsWith("image/")
        );
      },
      { message: "File must be an image or a PDF" }
    ),
});

// const ChatFileUpload: FC<ChatFileUploadProps> = ({ toggleFileUploadModal }) => {
//   const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { file: undefined },
  });

  async function handleUpload(values: z.infer<typeof formSchema>) {
    console.log("Uploading file...", values); // ✅ should print now

  //   const file = values.file?.[0];
  //   if (!file) {
  //     toast.error("No file selected");
  //     return;
  //   }

  //   setIsUploading(true);
  //   const supabase = createClient();
  //   const uniqueId = uuid();

  //   const fileTypePrefix =
  //     file.type === "application/pdf"
  //       ? "pdf"
  //       : file.type.startsWith("image/")
  //       ? "img"
  //       : "file";

  //   const fileName = `chat/${fileTypePrefix}-${uniqueId}`;

  //   const { data, error } = await supabase.storage
  //     .from("chat-files")
  //     .upload(fileName, file);

  //   setIsUploading(false);

  //   if (error) {
  //     console.error("Error uploading file:", error);
  //     toast.error("Upload failed");
  //     return;
  //   }

  //   toast.success("File uploaded successfully");
  //   toggleFileUploadModal();
  //   form.reset();
  // }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="border border-dashed border-gray-200 rounded-lg flex flex-col gap-1 p-6 items-center text-center">
          <File className="w-12 h-12 mb-2" />
          <Typography text="Drag and drop your files here" variant="p" />
          <Typography
            text="or click below to select a file"
            variant="p"
            className="text-gray-400 text-xs"
          />
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpload)}
            className="space-y-6"
          >
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
                      onChange={(e) => field.onChange(e.target.files)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isUploading}
              size="lg"
              className="w-full"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ChatFileUpload;

