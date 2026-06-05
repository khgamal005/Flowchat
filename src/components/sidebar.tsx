'use client';

import { FC, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { GoDot, GoDotFill } from 'react-icons/go';
import { GiNightSleep } from 'react-icons/gi';

import { User, Workspace } from '@/types/app';
import SidebarNav from '@/components/sidebar-nav';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Typography from '@/components/ui/typography';
import PreferencesDialog from '@/components/preferences-dialog';
import { useColorPreferences } from '@/providers/color-prefrences';
import { toggleUserAway, clearUserStatus } from '@/actions/update-user-status';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useMobileNav } from '@/providers/mobile-nav-context';

type SidebarProps = {
  userWorksapcesData: Workspace[];
  currentWorkspaceData: Workspace;
  userData: User;
};

const SIDEBAR_CLASSES = 'fixed top-0 left-0 pt-[68px] pb-8 z-30 flex flex-col justify-between items-center h-screen w-20';

const Sidebar: FC<SidebarProps> = ({
  userWorksapcesData,
  currentWorkspaceData,
  userData,
}) => {
  const { color } = useColorPreferences();
  const router = useRouter();
  const [isAway, setIsAway] = useState(userData.is_away);
  const { showSidebar, closeAll } = useMobileNav();

  let backgroundColor = 'bg-primary-dark';
  if (color === 'green') {
    backgroundColor = 'bg-green-700';
  } else if (color === 'blue') {
    backgroundColor = 'bg-blue-700';
  }

  const handleToggleAway = async () => {
    try {
      const result = await toggleUserAway();
      if (result.success) {
        setIsAway(result.is_away);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to toggle away status:', error);
    }
  };

  const handleClearStatus = async () => {
    try {
      const result = await clearUserStatus();
      if (result.success) {
        setIsAway(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to clear status:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth' });
  };

  const sidebarContent = (
    <>
      <SidebarNav
        currentWorkspaceData={currentWorkspaceData}
        userWorkspacesData={userWorksapcesData}
      />

      <div className='flex flex-col space-y-3'>
        <div
          className={`
          bg-[rgba(255,255,255,0.3)] cursor-pointer transition-all duration-300
          hover:scale-110 text-white grid place-content-center rounded-full w-10 h-10
          `}
        >
          <FiPlus size={28} />
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Popover>
                  <PopoverTrigger>
                    <div className='h-10 w-10 relative cursor-pointer'>
                      <div className='h-full w-full rounded-lg overflow-hidden'>
                        <Image
                          className='object-cover w-full h-full'
                          src={userData.avatar_url}
                          alt={userData.name || 'user'}
                          width={300}
                          height={300}
                        />
                        <div
                          className={cn(
                            'absolute z-10 rounded-full -right-[20%] -bottom-1',
                            backgroundColor
                          )}
                        >
                          {isAway ? (
                            <GoDot className='text-white text-xl' />
                          ) : (
                            <GoDotFill className='text-green-600' size={17} />
                          )}
                        </div>
                      </div>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent side='right'>
                    <div>
                      <div className='flex space-x-3'>
                        <Avatar>
                          <AvatarImage src={userData.avatar_url} />
                          <AvatarFallback>
                            {userData.name && userData.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                          <Typography
                            text={userData.name || userData.email}
                            variant='p'
                            className='font-bold'
                          />
                          <div className='flex items-center space-x-1'>
                            {isAway ? (
                              <GiNightSleep size='12' />
                            ) : (
                              <GoDotFill className='text-green-600' size='17' />
                            )}
                            <span className='text-xs'>
                              {isAway ? 'Away' : 'Active'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className='flex flex-col space-y-1'>
                        <Typography
                          variant='p'
                          text={
                            isAway
                              ? 'Set yourself as active'
                              : 'Set yourself as away'
                          }
                          className='hover:text-white hover:bg-blue-700 px-2 py-1 rounded cursor-pointer'
                          onClick={handleToggleAway}
                        />
                        <Typography
                          variant='p'
                          text={'Clear Status'}
                          className='hover:text-white hover:bg-blue-700 px-2 py-1 rounded cursor-pointer'
                          onClick={handleClearStatus}
                        />
                        <PreferencesDialog />
                        <hr className='bg-gray-400' />
                        <Typography
                          variant='p'
                          text={`Sign out of ${currentWorkspaceData.name}`}
                          className='hover:text-white hover:bg-blue-700 px-2 py-1 rounded cursor-pointer'
                          onClick={handleSignOut}
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </TooltipTrigger>
            <TooltipContent
              className='text-white bg-black border-black'
              side='right'
            >
              <Typography text={userData.name || userData.email} variant='p' />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );

  return (
    <>
      <aside className={cn(SIDEBAR_CLASSES, 'hidden md:flex')}>
        {sidebarContent}
      </aside>

      {showSidebar && (
        <div className='fixed inset-0 z-50 md:hidden'>
          <div className='fixed inset-0 bg-black/50' onClick={closeAll} />
          <aside className={SIDEBAR_CLASSES}>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
