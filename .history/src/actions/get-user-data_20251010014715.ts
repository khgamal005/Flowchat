import { supabaseServerClient } from "@/supabase/supabaseServer";

export const getUserData = async () => {
  const supabase = supabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.log("NO USER", error);
    return null;
  }

  const { data } = await supabase.from("users").select("*").eq("id", user.id).single();
  return data;
};
