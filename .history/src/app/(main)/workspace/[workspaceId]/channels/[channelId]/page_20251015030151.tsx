import { redirect } from 'next/navigation';

import { getUserData } from '@/actions/get-user-data';
import { Workspace as UserWorkspace } from '@/types/app';

import { getUserWorkspaceChannels } from '@/actions/get-user-workspace-channels';
import ChatGroup from '@/components/chat-group';
import { getCurrentWorksaceData, getUserWorkspaceData } from '@/actions/workspaces';
import Sidebar from '@/components/sidebar';
import InfoSection from '@/components/info-section';

const ChannelId = async ({ params }: { params: Promise<{ workspaceId: string; channelId: string }> }) => {
  const { workspaceId, channelId } = await params;

  const userData = await getUserData();
  if (!userData) return redirect('/auth');

  const [userWorkspaceData] = await getUserWorkspaceData(userData.workspaces!);
  const [currentWorkspaceData] = await getCurrentWorksaceData(workspaceId);

  const userWorkspaceChannels = await getUserWorkspaceChannels(
    currentWorkspaceData.id,
    userData.id
  );

  const currentChannelData = userWorkspaceChannels.find(
    (channel) => channel.id === channelId
  );

  if (!currentChannelData) return redirect('/');

  return (
      <div className=''>
        <Sidebar
          currentWorkspaceData={currentWorkspaceData}
          userData={userData}
          userWorkspacesData={userWorkspaceData as UserWorkspace[]}
        />
        <InfoSection
          currentWorkspaceData={currentWorkspaceData}
          userData={userData}
          userWorkspaceChannels={userWorkspaceChannels}
          currentChannelId={channelId}
        />
        channalid:

        
      </div>
  );
};

export default ChannelId;


