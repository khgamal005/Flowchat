'use server';


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
  const supabase = await createServerActionClient();

  // Use the same client instance for all operations
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { error: 'No user data' };
  }

  // Get user data using the same client
  const { data: userData, error: userQueryError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (userQueryError || !userData) {
    return { error: 'Failed to fetch user data' };
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

  // Your additional logic here...
  return { success: true, workspace: workspaceRecord };
};