import { getUserData } from "@/actions/get-user-data";
import { redirect } from "next/navigation";
export default async function Home() {
  const userData = await getUserData();
    console.log('USER in cors', user);

  if (!userData) return redirect("/auth");

  const userWorkspaceId = userData.workspaces?.[0];

  if (!userWorkspaceId) return redirect("/create-workspace");

  return redirect(`/workspace/${userWorkspaceId}`);
}
