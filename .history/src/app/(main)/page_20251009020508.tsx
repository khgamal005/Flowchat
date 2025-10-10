import { getUserData } from "@/actions/get-user-data";
import { redirect } from "next/navigation";

export default async function   Home() {



    const userData = await getUserData();
        console.log('USER DATA IN CREATE WORKSPACE ACTION', user);


  if (!userData) return redirect('/auth');

  const userWorkspaceId = userData.workspaces?.[0];

  if (!userWorkspaceId) return redirect('/create-workspace');

  if (userWorkspaceId) return redirect(`/workspace/${userWorkspaceId}`);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-300">
      <h1 className="text-4xl font-bold text-blue-500">
        Tailwind + Theme is working 🎉
      </h1>
    </div>
  );
}
