const ImageUpload = () => {
  const { imageUrl, updateImageUrl } = useCreateWorkspaceValues();

  const handleUploadComplete = async (res: any) => {
    updateImageUrl(res?.[0].url);
    
    // Add a small delay to ensure upload callbacks are complete
    await new Promise(resolve => setTimeout(resolve, 1000));
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
          onClick={() => updateImageUrl('')}
          className='absolute cursor-pointer -right-2 -top-2 z-10 hover:scale-110'
        />
      </div>
    );
  }

  return (
    <UploadDropzone
      endpoint='workspaceImage'
      onClientUploadComplete={handleUploadComplete}
      onUploadError={err => console.log(err)}
    />
  );
};