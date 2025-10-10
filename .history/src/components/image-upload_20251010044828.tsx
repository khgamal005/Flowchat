'use client';

import Image from 'next/image';
import { ImCancelCircle } from 'react-icons/im';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { useCreateWorkspaceValues } from '@/hooks/create-workspace-values';
import { UploadDropzone } from '@/lib/uploadthing';

const ImageUpload = () => {
  const { imageUrl, updateImageUrl } = useCreateWorkspaceValues();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  // Handle successful upload
  const handleUploadComplete = (res: { url?: string }[] | undefined) => {
    console.log('Upload complete callback triggered:', res);
    
    const uploadedUrl = res?.[0]?.url;
    if (uploadedUrl) {
      setUploadComplete(true);
      // Small delay to ensure the URL is fully processed
      setTimeout(() => {
        updateImageUrl(uploadedUrl);
        toast.success('Image uploaded successfully');
        setIsUploading(false);
      }, 500);
    } else {
      toast.error('No image URL returned. Please try again.');
      setIsUploading(false);
    }
  };

  // Handle upload errors
  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error);
    setIsUploading(false);
    setUploadComplete(false);
    toast.error('Image upload failed. Please try again.');
  };

  // Handle upload start
  const handleUploadBegin = () => {
    console.log('Upload started');
    setIsUploading(true);
    setUploadComplete(false);
  };

  // Reset state when imageUrl changes
  useEffect(() => {
    if (imageUrl) {
      setIsUploading(false);
      setUploadComplete(false);
    }
  }, [imageUrl]);

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
    <div className={isUploading ? 'opacity-50' : ''}>
      <UploadDropzone
        endpoint="workspaceImage"
        onClientUploadComplete={handleUploadComplete}
        onUploadError={handleUploadError}
        onUploadBegin={handleUploadBegin}
        config={{
          mode: "auto",
        }}
      />
      {isUploading && (
        <div className="text-center mt-2 text-sm text-gray-500">
          {uploadComplete ? 'Processing image...' : 'Uploading image...'}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;