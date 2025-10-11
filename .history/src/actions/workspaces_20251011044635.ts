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
    const supabase = createClient();

    // ✅ Force refresh of user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error("Session not found:", sessionError);
      return { error: "Not authenticated" };
    }

    const user = session.user;
    console.log("User in createWorkspace:", user?.id);

    // ✅ Insert workspace
    const { data: workspaceRecord, error } = await supabase
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
      console.error("DB insert error:", error);
      return { error: error.message };
    }

    // ✅ Add member
    const { error: memberError } = await supabase.from("workspace_members").insert({
      workspace_id: workspaceRecord.id,
      user_id: user.id,
      role: "admin",
    });

    if (memberError) console.error("Member insert error:", memberError);

    console.log("Workspace created successfully:", workspaceRecord.id);
    return { data: workspaceRecord };
  } catch (error) {
    console.error("Unexpected error in createWorkspace:", error);
    return { error: "Unexpected error" };
  }
};
