import { getUserData } from "@/actions/get-user-data";
import { redirect } from "next/navigation";
export default async function Home() {
  const userData = await getUserData();
    console.log('USER in main ', userData);

  return <div>Home Page</div>;
}
