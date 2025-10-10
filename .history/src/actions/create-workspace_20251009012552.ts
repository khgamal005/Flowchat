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
  try {
    const supabase = await supabaseServerClient();
    
    // Get fresh user data with the same client instance
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { error: 'Authentication failed' };
    }

    // Use the same supabase instance for all operations
    const { error, data: workspaceRecord } = await supabase
      .from('workspaces')
      .insert({
        image_url: imageUrl,
        name,
        super_admin: user.id,
        slug,
        invite_code,
      })
      .select('*')
      .single();

    if (error) {
      return { error: error.message };
    }

    // Update user workspace using the same client
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ active_workspace: workspaceRecord.id })
      .eq('id', user.id);

    if (updateError) {
      return { error: updateError.message };
    }

    // Add user to workspace members
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({
        user_id: user.id,
        workspace_id: workspaceRecord.id,
        role: 'admin'
      });

    if (memberError) {
      return { error: memberError.message };
    }

    return { success: true, workspace: workspaceRecord };
    
  } catch (error) {
    return { error: 'Internal server error' };
  }
};