import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const cookieStore = cookies(); // ✅ Remove await - it's synchronous!

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) { // ✅ Remove async from function
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options); // ✅ Remove await - it's synchronous!
            });
          } catch {
            // Ignore if inside a Server Component or Server Action
          }
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

  console.log("✅ User logged in:", session.user.id);
  return NextResponse.redirect(origin);
}