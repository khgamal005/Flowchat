import { redirect } from "next/navigation";

import { getUserData } from "@/actions/get-user-data";
import {
  getCurrentWorksaceData,
  getUserWorkspaceData,
} from "@/actions/workspaces";



const Workspace = async (props: {
  params: Promise<{ workspaceId: string }>;
}) => {
  const { workspaceId } = await props.params;

  // };





    return <div className="p-8 text-center text-red-600"></div>;
  }


  return (
    <>

      helloghj
    </>
  );
};

export default Workspace;
