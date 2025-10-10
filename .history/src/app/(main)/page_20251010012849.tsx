import { getUserData } from "@/actions/get-user-data";
import { redirect } from "next/navigation";
export default async function Home() {
  const userData = await getUserData();
    console.log('USER in cors', userData);

  return
}
