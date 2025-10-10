'use server';

import {  } from "@/supabase/supabaseServer";


export async function registerWithEmail({ email }: { email: string }) {
  const supabase = await ();

  const response = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_CURRENT_ORIGIN,
    },
  });

  return JSON.stringify(response);
}
