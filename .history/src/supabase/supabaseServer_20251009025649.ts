// src/supabase/supabaseServer.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function supabaseServerClient() {
  // Must be awaited inside route handlers
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // You cannot modify cookies here in route handlers
          // so we just silently skip to prevent Next.js errors
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // ignored
          }
        },
      },
    }
  );
}
