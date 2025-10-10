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
  // Add significant delay if image was just uploaded to avoid token conflicts
  if (imageUrl) {
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  const supabase = await supabaseServerClient();

  try {
    // Use getSession to avoid token refresh
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      console.log('Session error in createWorkspace:', sessionError);
      return { error: 'No valid session. Please sign in again.' };
    }

    const user = session.user;
    console.log('Creating workspace for user:', user.id);

    const { data: userData, error: userQueryError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (userQueryError || !userData) {
      console.log('User query error:', userQueryError);
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
      .select('*')
      .single();

    if (error) {
      console.log('Workspace creation error:', error);
      return { error: error.message };
    }

    console.log('Workspace created successfully:', workspaceRecord.id);
    return { success: true, workspace: workspaceRecord };
    
  } catch (error) {
    console.error('Unexpected error in createWorkspace:', error);
    return { error: 'Internal server error' };
  }
};