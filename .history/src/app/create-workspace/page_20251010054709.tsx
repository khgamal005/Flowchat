'use client';

import { useEffect, useState } from 'react';
import slugify from 'slugify';
import { v4 as uuid } from 'uuid';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Typography from '@/components/ui/typography';
import { useCreateWorkspaceValues } from '@/hooks/create-workspace-values';
import { useRouter } from 'next/navigation';
import { createWorkspace } from '@/actions/create-workspace';
import ImageUpload from '@/components/image-upload';
import { getUserData } from '@/actions/get-user-data';

const CreateWorkspace = () => {
  const { currStep } = useCreateWorkspaceValues();
  

  let stepInView = null;

  switch (currStep) {
    case 1:
      stepInView = <Step1 />;
      break;
    case 2:
      stepInView = <Step2 />;
      break;
    default:
      stepInView = <Step1 />;
  }

  return (
    <div className='w-screen h-screen grid place-content-center bg-neutral-800 text-white'>
      <div className='p-3 max-w-[550px]'>
        <Typography
          text={`step ${currStep} of 2`}
          variant='p'
          className='text-neutral-400'
        />

        {stepInView}
      </div>
    </div>
  );
};

export default CreateWorkspace;

const Step1 = () => {
  const { name, updateValues, setCurrStep } = useCreateWorkspaceValues();


  return (
    <>
      <Typography
        text='What is the name of your company or team'
        className='my-4'
      />

      <Typography
        text='This will be the name of your Flowchat workspace - choose something that your team will recognize.'
        className='text-neutral-300'
        variant='p'
      />

      <form className='mt-6'>
        <fieldset>
          <Input
            className='bg-neutral-700 text-white border-neutral-600'
            type='text'
            value={name}
            placeholder='Enter your company name'
            onChange={event => updateValues({ name: event.target.value })}
          />
          <Button
            type='button'
            className='mt-10'
            onClick={() => setCurrStep(2)}
            disabled={!name}
          >
            <Typography text='Next' variant='p' />
          </Button>
        </fieldset>
      </form>
    </>
  );
};

const Step2 = () => {
  const { setCurrStep, updateImageUrl, imageUrl, name } = useCreateWorkspaceValues();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
   useEffect(() => {
    const checkUser = async () => {
      const user = await getUserData();
          console.log('USER in  ', user);

    };
    
    checkUser();
  }, []);

  const handleSubmit = async () => {
    if (isSubmitting || !name) return;
    
    setIsSubmitting(true);
    try {
      const slug = slugify(name, { lower: true, strict: true });
      const invite_code = uuid();
      
      console.log('Creating workspace with:', { name, slug, invite_code });
      
      const result = await createWorkspace({ 
        imageUrl, 
        name, 
        slug, 
        invite_code 
      });
      
      if (result?.error) {
        console.error('Workspace creation error:', result.error);
        toast.error(result.error === 'Not authenticated' 
          ? "Please sign in again" 
          : "Couldn't create workspace. Please try again."
        );
        
        if (result.error === 'Not authenticated') {
          router.push('/auth');
        }
        return;
      }
      
      toast.success('Workspace created successfully');
      router.push('/');
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <>
      <Button
        size='sm'
        className='text-white'
        variant='link'
        onClick={() => setCurrStep(1)}
      >
        <Typography text='Back' variant='p' />
      </Button>

      <form>
        <Typography text='Add workspace avatar' className='my-4' />
        <Typography
          text='This image can be changed later in your workspace settings.'
          className='text-neutral-300'
          variant='p'
        />

        <fieldset
          disabled={isSubmitting}
          className='mt-6 flex flex-col items-center space-y-9'
        >
          <ImageUpload />
          <div className='space-x-5'>
            <Button
              onClick={() => {
                updateImageUrl('');
                handleSubmit();
              }}
            >
              <Typography text='Skip for now' variant='p' />
            </Button>

            {imageUrl ? (
              <Button
                type='button'
                onClick={handleSubmit}
                size='sm'
                variant='destructive'
              >
                <Typography text='Submit' variant='p' />
              </Button>
            ) : (
              <Button
                type='button'
                size='sm'
                className='text-white bg-gray-500'
              >
                <Typography text='Select an Image' variant='p' />
              </Button>
            )}
          </div>
        </fieldset>
      </form>
    </>
  );
};
