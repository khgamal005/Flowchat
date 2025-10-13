import { redirect } from "next/navigation";

import { getUserData } from "@/actions/get-user-data";
import {
  getCurrentWorksaceData,
} from "@/actions/workspaces";

const Workspace = async ({
  params: { workspaceId },
}: {
  params: { workspaceId: string };
}) => {
  const userData = await getUserData();

  if (!userData) return redirect("/auth");

  const [currentWorkspaceData] = await getCurrentWorksaceData(workspaceId);

  return (
    <>
      <div className="hidden md:block">{/* <Sidebar /> */}</div>
      <div className="md:hidden block min-h-screen">Mobile</div>
    </>
  );
};

export default Workspace;
