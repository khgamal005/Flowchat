// app/auth/callback/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = cookies(); // ✅ no await needed

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // ⚠️ must use ANON key, not publishable
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
              // ignore (when in server env)
            }
          },
        },
      }
    );

    // ✅ Exchange the code for a session and set the cookies
    await supabase.auth.exchangeCodeForSession(code);
  }

  // ✅ Redirect to homepage (or dashboard)
  return NextResponse.redirect(`${requestUrl.origin}/`);
}
