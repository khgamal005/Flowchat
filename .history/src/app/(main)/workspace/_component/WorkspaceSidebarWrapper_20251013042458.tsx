// components/WorkspaceSidebarWrapper.tsx
'use client';

import Sidebar from '@/components/sidebar';
import { User, Workspace as UserWorkspace } from '@/types/app';

type Props = {
  currentWorkspaceData: UserWorkspace;
  userData: User;
  userWorkspacesData: UserWorkspace[];
};

export default function WorkspaceSidebarWrapper({
  currentWorkspaceData,
  userData,
  userWorkspacesData,
}: Props) {
  return (
    <Sidebar
      currentWorkspaceData={currentWorkspaceData}
      userData={userData}
      userWorksapcesData={userWorkspacesData}
    />
  );
}
