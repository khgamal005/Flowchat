'use client';

import Image from 'next/image';
import { ImCancelCircle } from 'react-icons/im';
import { useState } from 'react';
import { toast } from 'sonner';

import { useCreateWorkspaceValues } from '@/hooks/create-workspace-values';
import { UploadDropzone } from '@/lib/uploadthing';

const ImageUpload = () => {
  const { imageUrl, updateImageUrl } = useCreateWorkspaceValues();
  const [isUploading, setIsUploading] = useState(false);

  // Handle successful upload
  const handleUploadComplete = async (res: { url?: string }[] | undefined) => {
    try {
      setIsUploading(false);

      const uploadedUrl = res?.[0]?.url;
      if (uploadedUrl) {
        // Give time for the image to be processed and accessible
        await new Promise((resolve) => setTimeout(resolve, 800));
        updateImageUrl(uploadedUrl);
        toast.success('Image uploaded successfully');
      } else {
        toast.error('No image URL returned. Please try again.');
      }
    } catch (error) {
      console.error('Error during upload completion:', error);
      toast.error('Failed to process image upload.');
    }
  };

  // Handle upload errors
  const handleUploadError = (error: Error) => {
    setIsUploading(false);
    console.error('Upload error:', error);
    toast.error('Image upload failed. Please try again.');
  };

  // Handle upload start
  const handleUploadStart = () => {
    setIsUploading(true);
  };

  // If image is already uploaded, show preview
  if (imageUrl) {
    return (
      <div className="relative flex items-center justify-center h-32 w-32">
        <Image
          src={imageUrl}
          alt="workspace"
          width={320}
          height={320}
          className="object-cover w-full h-full rounded-md"
          priority
        />

        <ImCancelCircle
          size={26}
          onClick={() => !isUploading && updateImageUrl('')}
          className={`absolute -right-2 -top-2 z-10 transition-transform hover:scale-110 ${
            isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        />

        {isUploading && (
          <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
            <span className="text-white text-sm">Processing...</span>
          </div>
        )}
      </div>
    );
  }

  // Otherwise show upload dropzone
  return (
    <div className={isUploading ? 'opacity-50 pointer-events-none' : ''}>
      <UploadDropzone
        endpoint="workspaceImage"
        onClientUploadComplete={handleUploadComplete}
        onUploadError={handleUploadError}
        onUploadBegin={handleUploadStart}
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
