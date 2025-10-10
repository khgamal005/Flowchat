import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function supabaseServerClient() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: () => cookieStore, // ✅ Pass function, no need to manually define get/set
    }
  );

  return supabase;
}
