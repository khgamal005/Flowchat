import { getUserData } from "@/actions/get-user-data";
import { redirect } from "next/navigation";

export default async function   Home() {



    const userData = await getUserData();
    ADD USER TO WORKSPACE
create
or replace function add_workspace_to_user (user_id uuid, new_workspace text) returns void as $$
BEGIN
  update users set workspaces = workspaces || array[new_workspace]
  where id = user_id;
END;
$$ language plpgsql;

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
