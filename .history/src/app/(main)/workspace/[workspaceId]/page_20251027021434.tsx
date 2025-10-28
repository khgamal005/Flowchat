import { redirect } from 'next/navigation';

import { getUserData } from '@/actions/get-user-data';
import {
  getCurrentWorksaceData,
  getUserWorkspaceData,
} from '@/actions/workspaces';
import Sidebar from '@/components/sidebar';
import { Workspace as UserWorkspace } from '@/types/app';
import InfoSection from '@/components/info-section';
import { getUserWorkspaceChannels } from '@/actions/get-user-workspace-channels';
import NoDataScreen from '@/components/no-data-component';

const Workspace = async (props: { params: Promise<{ workspaceId: string }> }) => {
  const { workspaceId } = await props.params; // ✅ await params here

  const userData = await getUserData();

  if (!userData) return redirect('/auth');

  const [userWorkspaceData] = await getUserWorkspaceData(userData.workspaces!);
  const [currentWorkspaceData] = await getCurrentWorksaceData(workspaceId);
  const userWorkspaceChannels = await getUserWorkspaceChannels(
    currentWorkspaceData.id,
    userData.id
  );
  con

  // if (userWorkspaceChannels.length) {
  //   redirect(
  //     `/workspace/${workspaceId}/channels/${userWorkspaceChannels[0].id}`
  //   );
  // }

  return (
    <>
      <div className='hidden md:block'>
        <Sidebar
          currentWorkspaceData={currentWorkspaceData}
          userData={userData}
          userWorksapcesData={userWorkspaceData as UserWorkspace[]}
        />
        <InfoSection
          currentWorkspaceData={currentWorkspaceData}
          userData={userData}
          userWorkspaceChannels={userWorkspaceChannels}
          currentChannelId=''
        />

        <NoDataScreen
          userId={userData.id}
          workspaceId={currentWorkspaceData.id}
          workspaceName={currentWorkspaceData.name}
        />
      </div>
      <div className='md:hidden block min-h-screen'>Mobile</div>
    </>
  );
};

export default Workspace;
