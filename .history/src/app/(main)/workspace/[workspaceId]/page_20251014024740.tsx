// src/app/[workspaceId]/page.tsx

import { redirect } from "next/navigation";
import { getUserData } from "@/actions/get-user-data";
import {
  getCurrentWorksaceData,
  getUserWorkspaceData,
} from "@/actions/workspaces";
import { Workspace as UserWorkspace } from "@/types/app";
import WorkspaceSidebarWrapper from "../_component/WorkspaceSidebarWrapper";
import Sidebar from "@/components/sidebar";
import InfoSection from "@/components/info-section";

const Workspace = async (props: {
  params: Promise<{ workspaceId: string }>;
}) => {
  const { workspaceId } = await props.params;

  const userData = await getUserData();
  if (!userData) return redirect("/auth");

  const [userWorkspaceData] = await getUserWorkspaceData(userData.workspaces!);
  const [currentWorkspaceData] = await getCurrentWorksaceData(workspaceId);
  console.log("Current Workspace Data:", currentWorkspaceData); // Debugging line


 

  return (
    <div className="hidden md:block">
        {/* <WorkspaceSidebarWrapper
          currentWorkspaceData={currentWorkspaceData}
        userData={userData}
        userWorkspacesData={userWorkspaceData as UserWorkspace[]}
      /> */}
           {/* <InfoSection
          currentWorkspaceData={currentWorkspaceData}
          userData={userData}
          userWorkspaceChannels={"  " as any  }
          currentChannelId=''
        /> */}
      ghhhkjjjjjjjjjjj
    </div>
  );
};

export default Workspace;