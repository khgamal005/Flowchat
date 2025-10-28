'use client';

import Sidebar from '@/components/sidebar';
import { User, Workspace as UserWorkspace } from '@/types/app';

type Props = {
  currentWorkspaceData: UserWorkspace;
  userData: User;
  userWorkspaceData: UserWorkspace[]; 
};

export default function WorkspaceSidebarWrapper({
  currentWorkspaceData,
  userData,
  userWorkspaceData,
}: Props) {
  return (
    <Sidebar
      currentWorkspaceData={currentWorkspaceData}
      userData={userData}
      userWorkspacesData={userWorkspacesData} 
    />
  );
}
