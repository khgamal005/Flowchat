'use server';

import { supabaseServerClientPages } from "@/supabase/supabaseSeverPages";
import { SupabaseAuthClient } from "@supabase/supabase-js/dist/module/lib/SupabaseAuthClient";


export async function registerWithEmail({ email }: { email: string }) {

  const response = await SupabaseAuthClient.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_CURRENT_ORIGIN,
    },
  });

  return JSON.stringify(response);
}
