'use server';

import { supabaseServerClient } from '@/supabase/supabaseServer';

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
  // Add artificial delay to separate from upload operations
  await new Promise(resolve => setTimeout(resolve, 2000));

  const supabase = await supabaseServerClient();

  try {
    // Use getSession first to avoid unnecessary token refresh
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return { error: 'No valid session. Please sign in again.' };
    }

    const user = session.user;

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
      return { error: error.message };
    }

    return { success: true, workspace: workspaceRecord };
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Internal server error' };
  }
};