import { redirect } from 'next/navigation';

import { getUserData } from '@/actions/get-user-data';
import ChatGroup from '@/components/chat-group';
import {
  getCurrentWorksaceData,
  getUserWorkspaceData,
} from '@/actions/workspaces';
import { getUserWorkspaceChannels } from '@/actions/get-user-workspace-channels';

const DirectMessage = async (props: {
  params: Promise<{ workspaceId: string; chatId: string }>;
}) => {
  const { chatId, workspaceId } = await props.params;
  const userData = await getUserData();

  if (!userData) return redirect('/auth');

  const [userWorkspacesData] = await getUserWorkspaceData(userData.workspaces!);

  const [currentWorkspaceData] = await getCurrentWorksaceData(workspaceId);
  if (!currentWorkspaceData) return redirect('/');

  const userWorkspaceChannels = await getUserWorkspaceChannels(
    workspaceId,
    userData.id
  );

  const currentChannelData = userWorkspaceChannels.find(
    channel => channel.id === chatId
  );

  return (
    <ChatGroup
      userData={userData}
      type='DirectMessage'
      currentChannelData={currentChannelData}
      currentWorkspaceData={currentWorkspaceData}
      userWorksapcesData={userWorkspacesData ?? []}
      slug={workspaceId}
      userWorkspaceChannels={userWorkspaceChannels}
      chatId={chatId}
      socketUrl='/api/web-socket/direct-messages'
      socketQuery={{
        channelId: currentChannelData?.id ?? '',
        workspaceId: currentWorkspaceData.id,
        recipientId: chatId,
      }}
      apiUrl='/api/direct-messages'
      headerTitle={'DIRECT MESSAGE'}
      paramKey='recipientId'
      paramValue={chatId}
    />
  );
};

export default DirectMessage;
