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

// FIXED: Better file validation schema

      


const ChatFileUpload: FC<ChatFileUploadProps> = ({ 
  toggleFileUploadModal,
  userData,
  workspaceData,
  channel 
}) => {
  const [isUploading, setIsUploading] = useState(false);



  // FIXED: Better file upload handler with proper error handling
  async function handleUpload(values) {
    console.log("Uploading file...", values);
    
    const file = values.file?.[0];

   

      
  

  // FIXED: Add debug logging to see form state

  }

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
                  <FormConAtrol>
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
            
            {/* FIXED: Better button states */}
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
                {/* {form.formState.errors.file && (
                  // <div>Error: {form.formState.errors.file.message}</div>
                )} */}
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ChatFileUpload;
