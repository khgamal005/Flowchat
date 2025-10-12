"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createWorkspace = async ({
  imageUrl,
  name,
  slug,
  invite_code,
  access_token,
}: {
  imageUrl?: string;
  name: string;
  slug: string;
  invite_code: string;
  access_token: string;
}) => {
  try {
    const cookieStore = await cookies();

    // ✅ Authenticated Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options);
              } catch {
                // ignore set errors (Next.js server cookies are read-only in some contexts)
              }
            });
          },
        },
      }
    );

    // ✅ Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error in createWorkspace:", authError);
      return { error: "Not authenticated" };
    }

    // ✅ Create workspace (super_admin = user.id)
    const { data: workspaceRecord, error: workspaceError } = await supabase
      .from("workspaces")
      .insert([
        {
          image_url: imageUrl ?? null,
          name,
          super_admin: user.id, // ✅ important — do not let default gen_random_uuid() run
          slug,
          invite_code,
          members: [user.id], // ✅ optional: add creator as member directly
        },
      ])
      .select("*")
      .single();

    if (workspaceError) {
      console.error("Database error:", workspaceError);
      return { error: workspaceError.message };
    }

    // ✅ Add user to workspace_members table (if you have this table)
    const { error: memberError } = await supabase
      .from("workspace_members")
      .insert([
        {
          workspace_id: workspaceRecord.id,
          user_id: user.id,
          role: "admin",
        },
      ]);

    if (memberError) console.error("Member creation error:", memberError);

    // ✅ Return the created workspace
    return { data: workspaceRecord };
  } catch (error) {
    console.error("Unexpected error in createWorkspace:", error);
    return { error: "An unexpected error occurred" };
  }
};
