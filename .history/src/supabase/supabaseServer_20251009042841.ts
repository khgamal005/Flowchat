"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createUploadSafeClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignore in Server Actions
          }
        },
      },
      auth: {
        flowType: 'pkce',
        autoRefreshToken: false,
        persistSession: true,
      },
    }
  );
}