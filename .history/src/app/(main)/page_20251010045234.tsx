import { getUserData } from "@/actions/get-user-data";
import { redirect } from "next/navigation";
export default async function Home() {


  return <div>Home Page</div>;
}
import { redirect } from 'next/navigation';

import { getUserData } from '@/actions/get-user-data';

export default async function Home() {
  const userData = await getUserData();

  if (!userData) return redirect('/auth');

  const userWorkspaceId = userData.workspaces?.[0];

  if (!userWorkspaceId) return redirect('/create-workspace');

  if (userWorkspaceId) return redirect(`/workspace/${userWorkspaceId}`);
}

