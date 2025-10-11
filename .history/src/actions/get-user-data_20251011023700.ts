import { createClient } from '@/supabase/supabaseServer';
import { User } from '@/types/app';

export const getUserData = async (): Promise<User | null> => {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await (await supabase).auth.getUser();

  if (userError || !user) {
    console.log('NO USER', userError);
    return null;
  }

  const { data, error } = await supabase
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
