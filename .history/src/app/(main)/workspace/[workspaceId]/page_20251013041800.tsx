import { redirect } from "next/navigation";
// You can use notFound for a proper 404/not-found page
// import { redirect, notFound } from "next/navigation";
import { getUserData } from "@/actions/get-user-data";
import {
  getCurrentWorksaceData,
  getUserWorkspaceData,
} from "@/actions/workspaces";
import { Workspace as UserWorkspace } from "@/types/app";
import Sidebar from "@/components/sidebar";

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
      <div className="hidden md:block">hee</div>
      <div className="md:hidden block min-h-screen">Mobile</div>
      <Sidebar
        currentWorkspaceData={currentWorkspaceData}
        userData={userData}
        userWorksapcesData={userWorkspaceData as UserWorkspace[]}
      />
      hello
    </>
  );
};

export default Workspace;
