import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function supabaseServerClient() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // Remove set/remove methods for server components
        // Cookie modifications should happen in Server Actions
      },
    }
  );

  return supabase;
}
}
