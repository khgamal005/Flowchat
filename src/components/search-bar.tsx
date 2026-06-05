import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Channel, Workspace } from '@/types/app';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from './ui/button';
import {
  addChannelToUser,
  updateChannelMembers,
  updateChannelRegulators,
  addChannelRegulator,
} from '@/actions/channels';
import { useColorPreferences } from '@/providers/color-prefrences';
import Typography from './ui/typography';

type SearchBarProps = {
  currentWorkspaceData: Workspace;
  currentChannelData?: Channel;
  loggedInUserId: string;
};

const SearchBar: FC<SearchBarProps> = ({
  currentWorkspaceData,
  loggedInUserId,
  currentChannelData,
}) => {
  const { color } = useColorPreferences();
  const router = useRouter();

  let backGroundColor = 'bg-[#7a4a7f] dark:bg-[#311834]';
  if (color === 'green') {
    backGroundColor = 'bg-green-200 dark:bg-green-900';
  } else if (color === 'blue') {
    backGroundColor = 'bg-blue-200 dark:bg-blue-900';
  }

  const isChannelMember = (memberId: string) => {
    return currentChannelData?.members?.includes(memberId) ?? false;
  };

  const isRegulator = (memberId: string) => {
    return currentChannelData?.regulators?.includes(memberId) ?? false;
  };

  const isChannelCreator = (memberId: string) => {
    return currentChannelData?.user_id === memberId;
  };

  const addUserToChannel = async (userId: string, channelId: string) => {
    await updateChannelMembers(channelId, userId);
    await addChannelToUser(userId, channelId);
    router.refresh();
    toast.success('User added to channel');
  };

  const addUserAsRegulator = async (userId: string, channelId: string) => {
    await addChannelRegulator(userId, channelId);
    router.refresh();
    toast.success('User added as regulator');
  };

  const makeUserRegulator = async (userId: string, channelId: string) => {
    await updateChannelRegulators(userId, channelId);
    router.refresh();
    toast.success('User is now a regulator');
  };

  const currentUserIsOwner = isChannelCreator(loggedInUserId);

  const allMembers = currentWorkspaceData?.members ?? [];
  const channelMembers = allMembers.filter(m => isChannelMember(m.id));
  const availableMembers = allMembers.filter(
    m => !isChannelMember(m.id) && m.id !== loggedInUserId
  );

  const MemberRow = ({
    member,
    isMember,
    isSelf,
  }: {
    member: { id: string; name?: string | null; email: string };
    isMember: boolean;
    isSelf: boolean;
  }) => (
    <div className='flex items-center my-2 justify-between'>
      <div className='flex items-center gap-2 p-2'>
        <span className='text-sm text-black dark:text-white'>
          {member?.name ?? member?.email}
        </span>
        {isChannelCreator(member.id) && (
          <span className='text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'>
            Owner
          </span>
        )}
        {isRegulator(member.id) && !isChannelCreator(member.id) && (
          <span className='text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'>
            Regulator
          </span>
        )}
        {isMember && !isRegulator(member.id) && !isChannelCreator(member.id) && (
          <span className='text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'>
            Member
          </span>
        )}
      </div>

      <div className='flex gap-x-2'>
        {currentUserIsOwner && !isSelf && isMember && !isRegulator(member.id) && (
          <Button
            className='text-[10px]'
            size='sm'
            variant='destructive'
            onClick={() => {
              if (!currentChannelData?.id) {
                toast.error('No channel selected');
                return;
              }
              makeUserRegulator(member.id, currentChannelData.id);
            }}
          >
            Assign Regulator
          </Button>
        )}

        {currentUserIsOwner && !isSelf && !isMember && (
          <>
            <Button
              className='text-[10px]'
              size='sm'
              onClick={() => {
                if (!currentChannelData?.id) {
                  toast.error('No channel selected');
                  return;
                }
                addUserToChannel(member.id, currentChannelData.id);
              }}
            >
              Add as Member
            </Button>
            <Button
              className='text-[10px]'
              size='sm'
              variant='secondary'
              onClick={() => {
                if (!currentChannelData?.id) {
                  toast.error('No channel selected');
                  return;
                }
                addUserAsRegulator(member.id, currentChannelData.id);
              }}
            >
              Add as Regulator
            </Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        'absolute h-10 w-[500px] px-3 top-2 rounded-md',
        backGroundColor
      )}
    >
      <Popover>
        <PopoverTrigger className='flex items-center space-x-2 w-full h-full'>
          <Search size={20} className='text-black dark:text-white' />
          <span className='text-sm text-black dark:text-white'>
            Search #{currentChannelData?.name ?? 'channel'}
          </span>
        </PopoverTrigger>

        <PopoverContent className='w-[500px]'>
          <ScrollArea className='rounded-md max-h-96'>
            {channelMembers.length > 0 && (
              <div className='mb-3'>
                <Typography
                  variant='p'
                  text='Channel Members'
                  className='text-xs font-semibold uppercase text-muted-foreground px-2 py-1'
                />
                {channelMembers.map(member => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    isMember
                    isSelf={member.id === loggedInUserId}
                  />
                ))}
              </div>
            )}

            {availableMembers.length > 0 && (
              <div>
                <Typography
                  variant='p'
                  text='Available Members'
                  className='text-xs font-semibold uppercase text-muted-foreground px-2 py-1'
                />
                {availableMembers.map(member => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    isMember={false}
                    isSelf={false}
                  />
                ))}
              </div>
            )}

            {channelMembers.length === 0 && availableMembers.length === 0 && (
              <Typography
                variant='p'
                text='No members found'
                className='text-sm text-muted-foreground px-2 py-4 text-center'
              />
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SearchBar;
