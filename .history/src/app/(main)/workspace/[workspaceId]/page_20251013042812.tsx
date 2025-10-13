import { redirect } from "next/navigation";

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

  // };

  const userData = await getUserData();
  if (!userData) return redirect("/auth");

  const [userWorkspaceData] = await getUserWorkspaceData(userData.workspaces!);
  const [currentWorkspaceData] = await getCurrentWorksaceData(workspaceId);

  if (!currentWorkspaceData) {
    return <div className="p-8 text-center text-red-600"></div>;
  }

  console.log(currentWorkspaceData);

  return (
    <>

      helloghj
    </>
  );
};

export default Workspace;
