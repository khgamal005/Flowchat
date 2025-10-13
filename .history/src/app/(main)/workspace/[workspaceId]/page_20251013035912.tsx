import { redirect } from "next/navigation";
import { getUserData } from "@/actions/get-user-data";
import {
  getCurrentWorksaceData,
  getUserWorkspaceData,
} from "@/actions/workspaces";
import { Workspace as UserWorkspace, Workspace } from "@/types/app";

import { Sidebar } from "lucide-react";

const Workspace = async (props: {
  params: Promise<{ workspaceId: string }>;
}) => {
  const { workspaceId } = await props.params; 
  type SidebarProps = {
  currentWorkspaceData: Workspace;
  userData: User;
  userWorksapcesData: Workspace[];
};

  const userData = await getUserData();
  if (!userData) return redirect("/auth");

  const [userWorkspaceData] = await getUserWorkspaceData(userData.workspaces!);
  const [currentWorkspaceData] = await getCurrentWorksaceData(workspaceId);
  console.log(userWorkspaceData);

  return (
    <>
      <div className="hidden md:block">hee</div>
      <div className="md:hidden block min-h-screen">Mobile</div>
      <Sidebar
        currentWorkspaceData={currentWorkspaceData}
        userData={userData}
        userWorksapcesData={userWorkspaceData as UserWorkspace[]}
      />
    </>
  );
};

export default Workspace;
