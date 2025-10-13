import { redirect } from "next/navigation";
import { getUserData } from "@/actions/get-user-data";
import { getCurrentWorksaceData } from "@/actions/workspaces";

const Workspace = async (props: { params: Promise<{ workspaceId: string }> }) => {
  const { workspaceId } = await props.params; // ✅ must await params

  const userData = await getUserData();
  if (!userData) return redirect("/auth");

  const [userWorkspaceData] = await getUserWorkspaceData(userData.workspaces!);
    const [currentWorkspaceData] = await getCurrentWorksaceData(workspaceId);


  return (
    <>
      <div className="hidden md:block">hee</div>
      <div className="md:hidden block min-h-screen">Mobile</div>
    </>
  );
};

export default Workspace;
