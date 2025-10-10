import Image from 'next/image';
import { ImCancelCircle } from 'react-icons/im';
import { useState } from 'react';
import { toast } from 'sonner';

import { useCreateWorkspaceValues } from '@/hooks/create-workspace-values';
import { UploadDropzone } from '@/lib/uploadthing';

const ImageUpload = () => {
  const { imageUrl, updateImageUrl } = useCreateWorkspaceValues();
  const [isUploading, setIsUploading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUploadComplete = async (res: any) => {
    try {
      setIsUploading(false);
      
      if (res?.[0]?.url) {
        // Wait a bit to ensure all upload processes are complete
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
    toast.error('Image upload failed. Please try again.');
  };

  const handleUploadStart = () => {
    setIsUploading(true);
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