'use client';

import { useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// ✅ Create browser-side Supabase client
export function createClient(): SupabaseClient {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// ✅ Hook to automatically refresh Supabase session on mount
export function useSupabaseAuthRefresh() {
  useEffect(() => {
    const supabase = createClient();

    const refreshSession = async () => {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('Session refresh failed:', error.message);
        } else {
          console.log('✅ Session refreshed:', data?.session?.user?.email);
        }
      } catch (err) {
        console.error('Unexpected error while refreshing session:', err);
      }
    };

//     refreshSession();
//   }, []);
// }
