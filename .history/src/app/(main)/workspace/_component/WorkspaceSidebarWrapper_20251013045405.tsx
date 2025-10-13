'use client';

import Sidebar from '@/components/sidebar';
import { User, Workspace as UserWorkspace } from '@/types/app';

type Props = {
  currentWorkspaceData: UserWorkspace;
  userData: User;
  userWorkspacesData: UserWorkspace[]; // ✅ consistent spelling
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
      userWorkspacesData// ✅ fixed spelling
    />
  );
}
