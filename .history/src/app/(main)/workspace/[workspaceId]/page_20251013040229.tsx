import { redirect } from "next/navigation";
import { getUserData } from "@/actions/get-user-data";
import {
  getCurrentWorksaceData,
  getUserWorkspaceData,
} from "@/actions/workspaces";
import { User, Workspace  } from "@/types/app";


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
      <Sideba
        currentWorkspaceData={currentWorkspaceData}
        userData={userData}
        userWorksapcesData={userWorkspaceData as Workspace[]}
      />
    </>
  );
};

export default Workspace;
