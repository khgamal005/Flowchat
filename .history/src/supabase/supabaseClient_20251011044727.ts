import { createBrowserClient } from '@supabase/ssr'
import { useEffect } from 'react';
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )
}
useEffect(() => {
  supabase.auth.refreshSession();
}, []);