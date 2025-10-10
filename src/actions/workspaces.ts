// actions/create-workspace.ts
"use server";

import { createClient } from '@/supabase/supabaseServer';

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
    const supabase = await createClient();
    
    // Get user directly in this action for fresh session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('User in createWorkspace:', user?.id);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return { error: "Not authenticated" };
    }

    // Create workspace
    const { error, data: workspaceRecord } = await supabase
      .from("workspaces")
      .insert({
        image_url: imageUrl,
        name,
        super_admin: user.id,
        slug,
        invite_code,
      })
      .select("*")
      .single();

    if (error) {
      console.error('Database error:', error);
      return { error: error.message };
    }

    // Add user as workspace member
    const { error: memberError } = await supabase
      .from("workspace_members")
      .insert({
        workspace_id: workspaceRecord.id,
        user_id: user.id,
        role: "admin",
      });

    if (memberError) {
      console.error('Member creation error:', memberError);
      // Don't fail the whole operation if member creation fails
    }

    console.log('Workspace created successfully:', workspaceRecord.id);
    return { data: workspaceRecord };

  } catch (error) {
    console.error('Unexpected error in createWorkspace:', error);
    return { error: "An unexpected error occurred" };
  }
};