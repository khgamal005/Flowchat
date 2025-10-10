// actions/create-workspace.ts
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch (error) {
              // Ignore
            }
          },
        },
      }
    );

    // Get the current user directly in this action
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('USER IN CREATE WORKSPACE ACTION:', user);
    
    if (authError || !user) {
      console.error('Auth error in createWorkspace:', authError);
      return { error: 'Not authenticated' };
    }

    // Create the workspace
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
      console.error('Database error:', error);
      return { error: error.message };
    }

    // Add the user to workspace_members table
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: workspaceRecord.id,
        user_id: user.id,
        role: 'admin',
      });

    if (memberError) {
      console.error('Member creation error:', memberError);
      // Don't return error here as workspace was created successfully
    }

    return { data: workspaceRecord };
    
  } catch (error) {
    console.error('Unexpected error in createWorkspace:', error);
    return { error: 'An unexpected error occurred' };
  }
};


