import Image from 'next/image';
import { ImCancelCircle } from 'react-icons/im';
import { useState } from 'react';
import { toast } from 'sonner';

import { useCreateWorkspaceValues } from '@/hooks/create-workspace-values';
import { UploadDropzone } from '@/lib/uploadthing';

const ImageUpload = () => {
  const { imageUrl, updateImageUrl } = useCreateWorkspaceValues();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleUploadComplete = (res: any) => {
    setIsUploading(false);

    if (res?.[0]?.url) {
      const url = res[0].url;
      setPreviewUrl(url);
      updateImageUrl(url);
      toast.success('Image uploaded successfully');
    }
  };

  const handleUploadError = (error: Error) => {
    setIsUploading(false);
    setPreviewUrl(null);
    toast.error('Image upload failed. Please try again.');
  };

  const handleUploadStart = () => {
    setIsUploading(true);
    setPreviewUrl(null);
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    updateImageUrl('');
  };

  const displayUrl = previewUrl || imageUrl;

  if (displayUrl) {
    return (
      <div className='flex items-center justify-center h-32 w-32 relative'>
        <Image
          src={displayUrl}
          className='object-cover w-full h-full rounded-md'
          alt='workspace'
          width={320}
          height={320}
          priority
        />
        <ImCancelCircle
          size={30}
          onClick={handleRemove}
          className='absolute cursor-pointer -right-2 -top-2 z-10 hover:scale-110'
        />
      </div>
    );
  }

  return (
    <div className={isUploading ? 'pointer-events-none opacity-50' : ''}>
      <UploadDropzone
        endpoint='workspaceImage'
        onClientUploadComplete={handleUploadComplete}
        onUploadError={handleUploadError}
        onUploadBegin={handleUploadStart}
      />
      {isUploading && (
        <div className='text-center mt-2 text-sm text-gray-500'>
          Uploading image... Please wait.
        </div>
      )}
    </div>
  );
};

export default ImageUpload;