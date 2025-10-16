// actions/get-user-data.ts
import { createClient } from '@/supabase/supabaseServer';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServerClientPages } from '@/supabase/supabaseSeverPages';
import { User } from '@/types/app';

export const getUserData = async (): Promise<User | null> => {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.log('Auth error in getUserData:', userError);
      return null;
    }

    if (!user) {
      console.log('No user found');
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single(); // Use single() instead of [0]

    if (error) {
      console.log('Database error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.log('Unexpected error in getUserData:', error);
    return null;
  }
};


export const getUserDataPages = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<User | null> => {
  const supabase = supabaseServerClientPages(req, res);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log('NO USER', user);
    return null;
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id);

  if (error) {
    console.log(error);
    return null;
  }

  return data ? data[0] : null;
};
