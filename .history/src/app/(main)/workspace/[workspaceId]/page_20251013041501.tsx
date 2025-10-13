import { redirect } from "next/navigation";
// You can use notFound for a proper 404/not-found page
// import { redirect, notFound } from "next/navigation"; 
import { getUserData } from "@/actions/get-user-data";
import {
  getCurrentWorksaceData,
  getUserWorkspaceData,
} from "@/actions/workspaces";
import { User, Workspace } from "@/types/app";
import Sidebar from "@/components/sidebar";

const Workspace = async (props: {
  params: Promise<{ workspaceId: string }>;
}) => {
  const { workspaceId } = await props.params;

  // Type definitions are fine, but can be removed from inside the component
  // if not strictly needed here (they don't hurt, but are redundant).
  // type SidebarProps = {
  //   currentWorkspaceData: Workspace;
  //   userData: User;
  //   userWorksapcesData: Workspace[];
  // };

  const userData = await getUserData();
  if (!userData) return redirect("/auth");

  const [userWorkspaceData] = await getUserWorkspaceData(userData.workspaces!);
  const [currentWorkspaceData] = await getCurrentWorksaceData(workspaceId);

  // FIX: Check if the current workspace data was found.
  // The Sidebar component expects a valid Workspace object, so if it's not found,
  // we must handle the error condition, such as redirecting or showing a 404.
  if (!currentWorkspaceData) {
    // Option 1: Redirect to a safe default page (e.g., first workspace, or a dashboard)
    // return redirect('/'); 
    
    // Option 2: Render a simple error message
    return (
        <div className="p-8 text-center text-red-600">
            {/* Error: Workspace with ID "{workspaceId}" not found or you don't have access. */}
        </div>
    );

  }
  
  console.log(currentWorkspaceData);

  return (
    <>
      <div className="hidden md:block">hee</div>
      <div className="md:hidden block min-h-screen">Mobile</div>
      <Sidebar
        currentWorkspaceData={currentWorkspaceData} 
        userData={userData}

        userWorksapcesData={userWorkspaceData as Workspace[]} 
      />
    </>
  );
};

export default Workspace;