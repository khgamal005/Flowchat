"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function supabaseServerClient() {
  // ✅ No await — cookies() is synchronous
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // ✅ This now works — cookieStore is not a Promise
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // ✅ Supabase calls this when it refreshes tokens
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  return supabase;
}
