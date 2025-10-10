import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function supabaseServerClientReadonly() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: name => cookieStore.get(name)?.value,
        set: () => {},     // no-op
        remove: () => {},  // no-op
      },
    }
  );
}


