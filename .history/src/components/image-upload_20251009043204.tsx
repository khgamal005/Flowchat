import Image from 'next/image';
import { ImCancelCircle } from 'react-icons/im';
import { useState } from 'react';
import { toast } from 'sonner';

import { useCreateWorkspaceValues } from '@/hooks/create-workspace-values';
import { UploadDropzone } from '@/lib/uploadthing';

const ImageUpload = () => {
  const { imageUrl, updateImageUrl } = useCreateWorkspaceValues();
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadComplete = async (res: any) => {
    try {
      if (res?.[0]?.url) {
        // Add a small delay to ensure all upload callbacks are complete
        await new Promise(resolve => setTimeout(resolve, 500));
        updateImageUrl(res[0].url);
      }
    } catch (error) {
      console.error('Error handling upload completion:', error);
      toast.error('Failed to process image upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error);
    setIsUploading(false);
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
        />
        <ImCancelCircle
          size={30}
          onClick={() => {
            if (!isUploading) {
              updateImageUrl('');
            }
          }}
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
    <div className={isUploading ? 'opacity-50 pointer-events-none' : ''}>
      <UploadDropzone
        endpoint='workspaceImage'
        onClientUploadComplete={handleUploadComplete}
        onUploadError={handleUploadError}
        onUploadBegin={handleUploadStart}
        config={{
          mode: 'auto',
        }}
      />
      {isUploading && (
        <div className="text-center mt-2 text-sm text-gray-500">
          Uploading image...
        </div>
      )}
    </div>
  );
};

export default ImageUpload;