import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, // or NEXT_PUBLIC_SUPABASE_ANON_KEY
      {
        auth: {
          persistSession: false, 
        },
      }
    );
  }

  return supabase;
}


// ✅ Hook to automatically refresh Supabase session on mount
// export function useSupabaseAuthRefresh() {
//   useEffect(() => {
//     const supabase = createClient();

//     const refreshSession = async () => {
//       try {
//         const { data, error } = await supabase.auth.refreshSession();
//         if (error) {
//           console.error('Session refresh failed:', error.message);
//         } else {
//           console.log('✅ Session refreshed:', data?.session?.user?.email);
//         }
//       } catch (err) {
//         console.error('Unexpected error while refreshing session:', err);
//       }
//     };

//     refreshSession();
//   }, []);
// }
