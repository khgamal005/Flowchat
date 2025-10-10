"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Global token management
let currentTokenRefresh: Promise<any> | null = null;
let lastTokenRefresh = 0;
const TOKEN_REFRESH_COOLDOWN = 5000; // 5 seconds cooldown

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
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: true,
      },
    }
  );

  // Safe session getter with cooldown
  const getSafeSession = async () => {
    const now = Date.now();
    
    // If we recently refreshed, wait for cooldown
    if (now - lastTokenRefresh < 1000) {
      await new Promise(resolve => setTimeout(resolve, 1000 - (now - lastTokenRefresh)));
    }

    // If a refresh is already in progress, wait for it
    if (currentTokenRefresh) {
      return await currentTokenRefresh;
    }

    // Create new refresh operation
    currentTokenRefresh = (async () => {
      try {
        lastTokenRefresh = Date.now();
        
        // Try to get session without forcing refresh
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.log('Session error, trying to recover...');
          // If session is invalid, clear cookies and return null
          if (sessionError.message.includes('Refresh Token')) {
            // Clear invalid tokens
            ['sb-access-token', 'sb-refresh-token'].forEach(name => {
              cookieStore.set(name, '', { maxAge: 0, path: '/' });
            });
            return { data: { session: null }, error: sessionError };
          }
          return { data: { session: null }, error: sessionError };
        }

        return { data: sessionData, error: null };
      } finally {
        currentTokenRefresh = null;
      }
    })();

    return currentTokenRefresh;
  };

  // Replace the auth methods with safe versions
  return {
    ...supabase,
    auth: {
      ...supabase.auth,
      getSession: getSafeSession,
      getUser: getSafeSession, // Use same logic for getUser
    }
  };
}