'use server';

import { createServerActionClient } from '@/supabase/supabaseServer';

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
  try {
    const supabase = await createServerActionClient();

    // Get user directly without separate getUserData call
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      // If token is invalid, try to sign out and return error
      await supabase.auth.signOut();
      return { error: 'Authentication failed. Please sign in again.' };
    }

    if (!user) {
      return { error: 'No user found' };
    }

    // Get user data in the same request
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