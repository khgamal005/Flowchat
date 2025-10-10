'use server';

import { supabaseServerClientPages } from "@/supabase/supabaseSeverPages";


export async function registerWithEmail({ email }: { email: string }) {

  const response = await supabasa.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_CURRENT_ORIGIN,
    },
  });

  return JSON.stringify(response);
}
