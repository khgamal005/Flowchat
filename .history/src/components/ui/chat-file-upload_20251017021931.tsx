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

// Add the form schema
const formSchema = z.object({
  file: z
    .any()
    .refine((files) => files?.length === 1, "File is required")
    .refine(
      (files) => {
        const file = files?.[0];
        if (!file) return false;
        
        const fileType = file.type || (file instanceof File ? file.type : '');
        return (
          fileType === "application/pdf" || 
          fileType.startsWith("image/")
        );
      },
      { message: "File must be an image or a PDF" }
    )
});

const ChatFileUpload: FC<ChatFileUploadProps> = ({ 
  toggleFileUploadModal,
  userData,
  workspaceData,
  channel 
}) => {
  const [isUploading, setIsUploading] = useState(false);

  // Initialize the form - THIS WAS MISSING
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { file: undefined },
  });

  // FIXED: Complete handleUpload function
  async function handleUpload(values: z.infer<typeof formSchema>) {
    console.log("Uploading file...", values);
    
    const file = values.file?.[0];
    if (!file) {
      toast.error("No file selected");
      return;
    }

    console.log("File details:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    setIsUploading(true);
    
    try {
      const supabase = createClient();
      const uniqueId = uuid();

      const fileTypePrefix =
        file.type === "application/pdf"
          ? "pdf"
          : file.type.startsWith("image/")
          ? "img"
          : "file";

      const fileName = `chat/${fileTypePrefix}-${uniqueId}-${file.name}`;

      console.log("Uploading to:", fileName);

      const { data, error } = await supabase.storage
        .from("chat-files")
        .upload(fileName, file);

      if (error) {
        console.error("Supabase upload error:", error);
        toast.error(`Upload failed: ${error.message}`);
        return;
      }

      console.log("Upload success:", data);
      toast.success("File uploaded successfully");
      toggleFileUploadModal();
      form.reset();
      
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsUploading(false);
    }
  }

  // FIXED: Add debug logging to see form state
  console.log("Form state:", {
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting
  });

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
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*,application/pdf"
                      {...field}
                      onChange={(e) => {
                        console.log("File selected:", e.target.files);
                        onChange(e.target.files);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              disabled={isUploading || !form.formState.isValid}
              size="lg"
              className="w-full"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
            
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500">
                Form valid: {form.formState.isValid ? 'Yes' : 'No'}
                {form.formState.errors.file && (
                  <div>Error: {form.formState.errors.file.message}</div>
                )}
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ChatFileUpload;