import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { type CookieOptions, createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if he don't have a code, redirect to error page
  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const cookieStore = await cookies(); // ✅ Add await here (it's actually async in newer versions)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, // ✅ add missing comma here

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
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );

  const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !session) {
    console.error("Supabase exchange error:", error);
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  console.log("User logged in:", session.user.id);

  // Redirect to home after successful login
  return NextResponse.redirect(origin);
}