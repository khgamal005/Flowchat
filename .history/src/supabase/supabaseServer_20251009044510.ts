"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Global lock to prevent concurrent token refreshes
let tokenRefreshLock: Promise<any> | null = null;

export async function supabaseServerClient() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignore in Server Actions
          }
        },
      },
      auth: {
        flowType: 'pkce',
        autoRefreshToken: false, // Crucial: disable auto-refresh
        detectSessionInUrl: false,
        persistSession: true,
      },
    }
  );

  // Wrap getUser with locking mechanism
  const originalGetUser = supabase.auth.getUser.bind(supabase.auth);
  supabase.auth.getUser = async () => {
    // If a token refresh is already in progress, wait for it
    if (tokenRefreshLock) {
      return await tokenRefreshLock;
    }

    // Create a new lock for this request
    tokenRefreshLock = (async () => {
      try {
        // First try to get the session without forcing refresh
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          return { data: { user: session.user }, error: null };
        }

        // If no session, try to get user (this might refresh token)
        return await originalGetUser();
      } catch (error) {
        return { data: { user: null }, error };
      } finally {
        tokenRefreshLock = null;
      }
    })();

    return tokenRefreshLock;
  };

  return supabase;
}

export async function createReadOnlyClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // No setAll method - read only
      },
      auth: {
        flowType: 'pkce',
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}