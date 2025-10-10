import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { type CookieOptions, createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    // no code → redirect to error page
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const cookieStore = cookies(); // ✅ no await needed here

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, // ✅ comma added here
    {
      cookies: {
        // return all cookies as array
        getAll() {
          return cookieStore.getAll().map((c) => ({
            name: c.name,
            value: c.value,
          }));
        },
        // set multiple cookies at once
        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({
              name,
              value,
              options,
            }: {
              name: string;
              value: string;
              options?: CookieOptions;
            }) => {
              cookieStore.set({ name, value, ...options });
            }
          );
        },
      },
    }
  );

  const {
    data: { session },
    error,
  } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !session) {
    console.error("Supabase exchange error:", error);
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  console.log("User logged in:", session.user.id);

  // Redirect to home after successful login
  return NextResponse.redirect(origin);
}
