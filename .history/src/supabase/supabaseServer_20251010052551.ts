'use server';

import { getUserData } from "@/actions/get-user-data";




export const createWorkspace = async ({
  imageUrl,
  name,
  slug,
  invite_code,
}: {
  imageUrl?: string;
  name: string;
  slug: string;
  invite_code: string;
}) => {
  const supabase = await supabaseServerClient();
  const userData = await getUserData();

  if (!userData) {
    return { error: 'No user data' };
  }

  const { error, data: workspaceRecord } = await supabase
    .from('workspaces')
    .insert({
      image_url: imageUrl,
      name,
      super_admin: userData.id,
      slug,
      invite_code,
    })
    .select('*');

  if (error) {
    return { error };
  }
}