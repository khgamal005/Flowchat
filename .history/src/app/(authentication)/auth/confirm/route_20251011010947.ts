import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type EmailOtpType } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';
  
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;

  if (token_hash && type) {
    const cookieStore = await cookies(); // ✅ Add await (cookies() is async in App Router)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // Ignore - middleware will handle session refresh
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ 
                name, 
                value: '', 
                ...options, 
                maxAge: 0 
              });
            } catch (error) {
              // Ignore
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    console.log('OTP Verification:', error ? `Error: ${error.message}` : 'Success');

    if (!error) {
      return NextResponse.redirect(redirectTo);
    }
  }

  // redirect to error page if verification fails
  redirectTo.pathname = '/auth/auth-code-error';
  return NextResponse.redirect(redirectTo);
}