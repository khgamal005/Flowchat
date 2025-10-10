import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Use this in server components where you don't need to modify cookies
export async function supabaseReadOnlyClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // No setAll method for read-only operations
      },
    }
  );
}
