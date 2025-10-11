import { createClient } from '@/supabase/supabaseServer';
import { User } from '@/types/app';

export const getUserData = async (): Promise<User | null> => {
  const supabase = await createClient(); // ← Single await here

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(); // ← No double await

  if (userError || !user) {
    console.log('NO USER', userError);
    return null;
  }

  const { data, error } = await supabase // ← No double await
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.log('Supabase user fetch error:', error);
    return null;
  }

  return data;
};