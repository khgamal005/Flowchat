// actions/register-with-email.ts
"use server";

import { createServerSupabaseClient } from "@/supabase/server";

export async function registerWithEmail({ email }: { email: string }) {
  const supabase = await createServerSupabaseClient();

  const response = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });

  return response;
}
