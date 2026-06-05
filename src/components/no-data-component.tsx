'use client';

import { FC, useState } from 'react';
import { IoMdMenu } from 'react-icons/io';
import { FaListUl } from 'react-icons/fa6';

import Typography from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import CreateChannelDialog from '@/components/create-channel-dialog';
import { useMobileNav } from '@/providers/mobile-nav-context';

const NoDataScreen: FC<{
  workspaceName: string;
  userId: string;
  workspaceId: string;
}> = ({ userId, workspaceId, workspaceName }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toggleSidebar, toggleInfoSection } = useMobileNav();

  return (
    <div className='w-full min-h-screen md:min-h-0 md:h-[calc(100vh-63px)]'>
      <div className='md:hidden flex items-center justify-between px-4 h-10 bg-white dark:bg-neutral-800 border-b border-b-white/30 shadow-md'>
        <Typography
          text={workspaceName}
          variant='p'
          className='font-bold truncate'
        />
        <div className='flex items-center gap-2'>
          <button
            className='text-foreground p-1'
            onClick={toggleSidebar}
            aria-label='Toggle sidebar'
          >
            <IoMdMenu size={20} />
          </button>
          <button
            className='text-foreground p-1'
            onClick={toggleInfoSection}
            aria-label='Toggle channel list'
          >
            <FaListUl size={18} />
          </button>
        </div>
      </div>

      <div className='p-4'>
        <Typography
          text={`👋 Welcome to the # ${workspaceName} workspace`}
          variant='h3'
        />
        <Typography
          text='Get started by creating a channel or direct message'
          variant='p'
          className='my-3'
        />

        <div className='w-fit'>
          <Button className='w-full my-2' onClick={() => setDialogOpen(true)}>
            <Typography text='Create Channel' variant='p' />
          </Button>
        </div>

        <CreateChannelDialog
          userId={userId}
          workspaceId={workspaceId}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
        />
      </div>
    </div>
  );
};

export default NoDataScreen;
