// src/app/[workspaceId]/page.tsx

import { redirect} from "next/navigation";
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

  const userData = await getUserData();
  if (!userData) return redirect("/auth");


  console.log("Current Workspace Data:", userData); // Debugging line

 

  return (
    <div className="hidden md:block">

      
      ghhh
    </div>
  );
};

export default Workspace;