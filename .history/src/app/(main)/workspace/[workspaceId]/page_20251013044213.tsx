import { redirect } from "next/navigation";

import { getUserData } from "@/actions/get-user-data";
import {
  getCurrentWorksaceData,
  getUserWorkspaceData,
} from "@/actions/workspaces";
import { Workspace as UserWorkspace } from '@/types/app';
import WorkspaceSidebarWrapper from "../_component/WorkspaceSidebarWrapper";


const Workspace = async (props: {
  params: Promise<{ workspaceId: string }>;
}) => {
  const { workspaceId } = await props.params;

  const userData = await getUserData();

  if (!userData) return redirect("/auth");

  const [userWorkspaceData] = await getUserWorkspaceData(userData.workspaces!);

  const [currentWorkspaceData] = await getCurrentWorksaceData(workspaceId);

  return(
        <div className='hidden md:block'>
                  <WorkspaceSidebarWrapper
          currentWorkspaceData={currentWorkspaceData}
          userData={userData}
          userWorksapcesData={userWorkspaceData as Workspace[]}
        />


          ghhh
        
        </div>)
  
  
};

export default Workspace;
