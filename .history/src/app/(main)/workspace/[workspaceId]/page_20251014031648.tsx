import { redirect } from 'next/navigation';

import { getUserData } from '@/actions/get-user-data';
import {
  getCurrentWorksaceData,
  getUserWorkspaceData,
} from '@/actions/workspaces';
import Sidebar from '@/components/sidebar';
import { Workspace as UserWorkspace } from '@/types/app';
import InfoSection from '@/components/info-section';


const Workspace = async ({
  params: { workspaceId },
}: {
  params: { workspaceId: string };
}) => {
  const userData = await getUserData();

  if (!userData) return redirect('/auth');

  const [userWorkspaceData] = await getUserWorkspaceData(userData.workspaces!);

  const [currentWorkspaceData] = await getCurrentWorksaceData(workspaceId);




  return (
    <>
      <div className='hidden md:block'>
        <Sidebar
          currentWorkspaceData={currentWorkspaceData}
          userData={userData}
          userWorkspacesData={userWorkspaceData as UserWorkspace[]}
        />
        <InfoSection
          currentWorkspaceData={currentWorkspaceData}
          userData={userData}
          userWorkspaceChannels={"  " as any  }
          currentChannelId=''
        />

        
      </div>
      <div className='md:hidden block min-h-screen'>Mobile</div>
    </>
  );
};

export default Workspace;
