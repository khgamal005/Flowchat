// src/app/[workspaceId]/page.tsx

import { redirect, notFound } from "next/navigation";
import { getUserData } from "@/actions/get-user-data";
import {
  getCurrentWorksaceData,
  getUserWorkspaceData,
} from "@/actions/workspaces";
import { Workspace as UserWorkspace } from "@/types/app";
import WorkspaceSidebarWrapper from "../_component/WorkspaceSidebarWrapper";

const Workspace = async (props: {
  params: Promise<{ workspaceId: string }>;
}) => {
  const { workspaceId } = await props.params;

  const userData = await getUserData();
  if (!userData) return redirect("/auth");

  const [userWorkspaceData] = await getUserWorkspaceData(userData.workspaces!);
  const [currentWorkspaceData] = await getCurrentWorksaceData(workspaceId);
  co

  // 🛑 CRITICAL FIX: If the workspace data is null, halt rendering 
  // and trigger the nearest not-found page (or not-found.tsx).
 

  return (
    <div className="hidden md:block">
      <WorkspaceSidebarWrapper
        // The data is now guaranteed to be a valid Workspace object
        currentWorkspaceData={currentWorkspaceData} 
        userData={userData}
        // Assuming you have fixed the typo 'userWorksapcesData' to 'userWorkspacesData' 
        userWorkspacesData={userWorkspaceData as UserWorkspace[]}
      />
      ghhh
    </div>
  );
};

export default Workspace;