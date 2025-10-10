import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookie: () => cookieStore,
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'user@example.com',
    password: '123456',
  });

  return Response.json({ data, error });
}
