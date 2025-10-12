import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const cookieStore = await cookies(); // ✅ await here!

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        async setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              await cookieStore.set(name, value, options); // ✅ await set too
            }
          } catch {
            // Ignore if inside a Server Component
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
