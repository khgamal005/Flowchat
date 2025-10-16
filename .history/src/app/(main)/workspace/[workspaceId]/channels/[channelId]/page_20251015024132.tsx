import { redirect } from 'next/navigation';

import { getUserData } from '@/actions/get-user-data';
import { Workspace as UserWorkspace } from '@/types/app';

import { getUserWorkspaceChannels } from '@/actions/get-user-workspace-channels';
import ChatGroup from '@/components/chat-group';
import { getCurrentWorksaceData, getUserWorkspaceData } from '@/actions/workspaces';

const ChannelId = async ({
  params: { channelId, workspaceId },
}: {
  params: {
    workspaceId: string;
    channelId: string;
  };
}) => {
  const userData = await getUserData();

  if (!userData) return redirect('/auth');

  const [userWorkspaceData] = await getUserWorkspaceData(userData.workspaces!);

  const [currentWorkspaceData] = await getCurrentWorksaceData(workspaceId);

  const userWorkspaceChannels = await getUserWorkspaceChannels(
    currentWorkspaceData.id,
    userData.id
  );

  const currentChannelData = userWorkspaceChannels.find(
    channel => channel.id === channelId
  );

  if (!currentChannelData) return redirect('/');

  return (
    <div className=' '>
      work

    </div>
  );
};

export default ChannelId;
