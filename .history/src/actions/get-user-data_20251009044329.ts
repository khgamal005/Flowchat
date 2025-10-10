import { createReadOnlyClient } from '@/supabase/supabaseServer';

export async function getUserData() {
  const supabase = await createReadOnlyClient();

  // Use getSession instead of getUser to avoid token refresh
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.user) {
    console.log('No valid session:', sessionError);
    return null;
  }

  const { data, error: queryError } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (queryError) {
    console.log('Query error:', queryError);
    return null;
  }

  return data;
}