// actions/get-user-data.ts
"use server";

import { createClient } from '@/supabase/supabaseServer';
import { User } from '@/types/app';

export const getUserData = async (): Promise<User | null> => {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log('Authentication error:', userError);
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.log('User data fetch error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.log('Unexpected error in getUserData:', error);
    return null;
  }
};