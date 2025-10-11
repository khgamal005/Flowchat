'use client';

import { useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

// ✅ Optional custom hook to refresh session automatically
export function useSupabaseAuthRefresh() {
  useEffect(() => {
    const supabase = createClient();

    const refresh = async () => {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) console.error('Session refresh failed:', error);
      else console.log('Session refreshed:', data);
    };

    refresh();
  }, []);
}
