import { createSimpleClient } from '@/supabase/supabaseServer';

export async function getUserData() {
  const supabase = await createSimpleClient();

  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session?.user) {
    console.log('No valid session in getUserData');
    return null;
  }

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single();

  return data;
}