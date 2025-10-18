"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies(); // ✅ await because it's async in Next 14+

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // ✅ fix this line
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // setAll(cookiesToSet) {
        //   try {
        //     cookiesToSet.forEach(({ name, value, options }) => {
        //       cookieStore.set(name, value, options);
        //     });
        //   } catch {
        //     // ignored — happens in Server Components or Server Actions
        //   }
        // },
      },
    }
  );
}
