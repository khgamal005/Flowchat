'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createWorkspace = async ({
  imageUrl,
  name,
  slug,
  invite_code,
  access_token, // ✅ added
}: {
  imageUrl?: string;
  name: string;
  slug: string;
  invite_code: string;
  access_token?: string; // ✅ added optional type
}) => {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
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
            } catch (error) {}
          },
        },
      }
    );

    // ✅ if no cookie but access_token provided, set the session manually
    if (access_token) {
      await supabase.auth.setSession({ access_token, refresh_token: '' });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

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

    // Add member record
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: workspaceRecord.id,
        user_id: user.id,
        role: 'admin',
      });

    if (memberError) console.error('Member creation error:', memberError);

    return { data: workspaceRecord };
  } catch (error) {
    console.error('Unexpected error in createWorkspace:', error);
    return { error: 'An unexpected error occurred' };
  }
};
