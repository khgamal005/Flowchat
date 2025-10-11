"use server";

import { createClient } from "@/supabase/supabaseServer";

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
    // 👇 FIX: Await createClient()
    const supabase = await createClient();

    // ✅ Check session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      console.error("Session not found or invalid:", sessionError);
      return { error: "Not authenticated" };
    }

    const user = session.user;
    console.log("User in createWorkspace:", user.id);

    // ✅ Insert workspace
    const { data: workspaceRecord, error: workspaceError } = await supabase
      .from("workspaces")
      .insert([
        {
          image_url: imageUrl || null,
          name,
          super_admin: user.id,
          slug,
          invite_code,
          
        },
      ])
      .select()
      .single();

    if (workspaceError) {
      console.error("DB insert error:", workspaceError);
      return { error: workspaceError.message };
    }

    // ✅ Add member
    const { error: memberError } = await supabase.from("workspace_members").insert([
      {
        workspace_id: workspaceRecord.id,
        user_id: user.id,
        role: "admin",
      },
    ]);

    if (memberError) {
      console.error("Member insert error:", memberError);
      return {
        data: workspaceRecord,
        warning: "Workspace created, but failed to add member.",
      };
    }

    console.log("✅ Workspace created successfully:", workspaceRecord.id);
    return { data: workspaceRecord };
  } catch (error) {
    console.error("Unexpected error in createWorkspace:", error);
    return { error: "Unexpected server error" };
  }
};
