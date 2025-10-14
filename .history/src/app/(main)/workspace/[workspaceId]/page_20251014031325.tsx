// src/app/[workspaceId]/page.tsx

import { redirect} from "next/navigation";
import { getUserData } from "@/actions/get-user-data";


const Workspace = async (props: {
  params: Promise<{ workspaceId: string }>;
}) => {

  const userData = await getUserData();
  if (!userData) return redirect("/auth");


  console.log("Current Workspace Data:", userData); // Debugging line

 

  return (
    <div className=" md:block">

      
      ghhh
    </div>
  );
};

export default Workspace;