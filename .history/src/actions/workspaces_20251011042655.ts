// actions/create-workspace.ts
"use server";

import { createClient } from '@/supabase/supabaseServer';
import { revalidatePath } from 'next/cache';

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
    
    // First, refresh the session to ensure we have the latest
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Session error:', sessionError);
      return { error: "Not authenticated" };
    }

    // Now get user with fresh session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('User in createWorkspace:', user?.id);
    console.log('Session valid:', session.access_token ? 'Yes' : 'No');
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return { error: "Not authenticated" };
    }

    // Check if workspace with this slug already exists
    const { data: existingWorkspace } = await supabase
      .from("workspaces")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existingWorkspace) {
      return { error: "Workspace with this name already exists" };
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
      // Continue anyway - the workspace was created
    }

    console.log('Workspace created successfully:', workspaceRecord.id);
    
    // Revalidate any relevant paths
    revalidatePath('/');
    revalidatePath('/create-workspace');
    
    return { data: workspaceRecord };

  } catch (error) {
    console.error('Unexpected error in createWorkspace:', error);
    return { error: "An unexpected error occurred" };
  }
};