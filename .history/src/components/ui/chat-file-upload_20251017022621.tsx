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

// SIMPLIFIED form schema for testing
const formSchema = z.object({
  file: z.any() // Accept any file for now to test
});

const ChatFileUpload: FC<ChatFileUploadProps> = ({ 
  toggleFileUploadModal,
  userData,
  workspaceData,
  channel 
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { file: undefined },
  });

  // Debug form state changes
  console.log("Form state:", {
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    isDirty: form.formState.isDirty
  });

  async function handleUpload(values: z.infer<typeof formSchema>) {
    console.log("✅ handleUpload called!", values);
    
    const file = values.file?.[0];
    if (!file) {
      console.log("❌ No file found");
      toast.error("No file selected");
      return;
    }

    console.log("📁 File details:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // For now, just test the console log and show success
    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      console.log("✅ Upload simulation complete");
      toast.success("File uploaded successfully (test)");
      toggleFileUploadModal();
      form.reset();
      setIsUploading(false);
    }, 2000);
  }

  // Test if function is accessible
  const testClick = () => {
    console.log("🔴 Manual button test - function is accessible");
    const currentValues = form.getValues();
    console.log("Current form values:", currentValues);
    handleUpload(currentValues);
  };

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
                        const files = e.target.files;
                        console.log("📂 File input changed:", files);
                        onChange(files);
                        
                        // Manually trigger validation
                        setTimeout(() => {
                          console.log("Form validity after file select:", form.formState.isValid);
                          console.log("Form errors:", form.formState.errors);
                        }, 100);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* TEMPORARY: Test button without validation */}
            <Button
              type="button"
              onClick={testClick}
              size="lg"
              className="w-full bg-red-500"
            >
              TEST BUTTON (Check Console)
            </Button>
            
            <Button
              type="submit"
              disabled={isUploading}
              size="lg"
              className="w-full"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
            
            {/* Debug info */}
            <div className="text-xs text-gray-500 p-2 border rounded">
              <div>Form valid: {form.formState.isValid ? 'Yes' : 'No'}</div>
              <div>Form dirty: {form.formState.isDirty ? 'Yes' : 'No'}</div>
              <div>Errors: {JSON.stringify(form.formState.errors)}</div>
              <div>Has file: {form.watch('file')?.length > 0 ? 'Yes' : 'No'}</div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ChatFileUpload;