import { redirect } from 'next/navigation';

import { getUserData } from '@/actions/get-user-data';
import {
  getCurrentWorksaceData,
  getUserWorkspaceData,
} from '@/actions/workspaces';
import { getUserWorkspaceChannels } from '@/actions/get-user-workspace-channels';
import ChatGroup from '@/components/chat-group';

const ChannelId = async (props: {
  params: Promise<{ workspaceId: string; channelId: string }>;
}) => {
  // ✅ await params before destructuring
  const { workspaceId, channelId } = await props.params;

  const userData = await getUserData();
  if (!userData) return redirect('/auth');

  const [userWorkspaceData] = await getUserWorkspaceData(userData.workspaces!);
  const [currentWorkspaceData] = await getCurrentWorksaceData(workspaceId);

  if (!currentWorkspaceData) return redirect('/');

  const userWorkspaceChannels = await getUserWorkspaceChannels(
    currentWorkspaceData.id,
    userData.id
  );

  const currentChannelData = userWorkspaceChannels.find(
    channel => channel.id === channelId
  );

  if (!currentChannelData) return redirect('/');

  return (
    <ChatGroup
      type='Channel'
      userData={userData}
      currentChannelData={currentChannelData}
      currentWorkspaceData={currentWorkspaceData}
      slug={workspaceId}
      chatId={channelId}
      userWorkspaceChannels={userWorkspaceChannels}
      socketUrl='/api/web-socket/messages'
      socketQuery={{
        channelId: currentChannelData.id,
        workspaceId: currentWorkspaceData.id,
      }}
      apiUrl='/api/messages'
      headerTitle={currentChannelData.name}
      paramKey='channelId'
      paramValue={channelId}
      userWorksapcesData={userWorkspaceData ?? []}
    />
  );
};

export default ChannelId;
