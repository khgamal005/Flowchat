// components/ImageUpload.tsx
import Image from 'next/image';
import { ImCancelCircle } from 'react-icons/im';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { useCreateWorkspaceValues } from '@/hooks/create-workspace-values';
import { UploadDropzone } from '@/lib/uploadthing';
import { createClient } from '@/supabase/supabaseClient'; // Your browser client

const ImageUpload = () => {
  const { imageUrl, updateImageUrl } = useCreateWorkspaceValues();
  const [isUploading, setIsUploading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const supabase = createClient();

  // Get the current session on component mount
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setAccessToken(session?.access_token || null);
    };

    getSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setAccessToken(session?.access_token || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleUploadComplete = async (res: any) => {
    try {
      setIsUploading(false);
      
      if (res?.[0]?.url) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        updateImageUrl(res[0].url);
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('Error handling upload completion:', error);
      toast.error('Failed to process image upload');
    }
  };

  const handleUploadError = (error: Error) => {
    setIsUploading(false);
    console.error('Upload error:', error);
    
    if (error.message.includes('Unauthorized')) {
      toast.error('Please log in to upload images');
    } else {
      toast.error('Image upload failed. Please try again.');
    }
  };

  const handleUploadStart = () => {
    setIsUploading(true);
  };

  // Get current session right before upload
  const handleUploadBegin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      return {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      };
    }
    return {};
  };

  if (imageUrl) {
    return (
      <div className='flex items-center justify-center h-32 w-32 relative'>
        <Image
          src={imageUrl}
          className='object-cover w-full h-full rounded-md'
          alt='workspace'
          width={320}
          height={320}
          priority
        />
        <ImCancelCircle
          size={30}
          onClick={() => !isUploading && updateImageUrl('')}
          className={`absolute cursor-pointer -right-2 -top-2 z-10 hover:scale-110 ${
            isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        />
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center">
            <div className="text-white text-sm">Processing...</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={isUploading ? 'opacity-50' : ''}>
      <UploadDropzone
        endpoint='workspaceImage'
        onClientUploadComplete={handleUploadComplete}
        onUploadError={handleUploadError}
        onUploadBegin={handleUploadStart}
        onUploadBegin={handleUploadBegin} // Use onBeforeUploadBegin for headers
      />
      {isUploading && (
        <div className="text-center mt-2 text-sm text-gray-500">
          Uploading image... Please wait.
        </div>
      )}
    </div>
  );
};

export default ImageUpload;