import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // ✅ Always create a mutable response first
  const response = NextResponse.redirect(requestUrl.origin);

  if (code) {
    // ✅ Await cookies() because it returns a Promise in route handlers
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // use ANON key here, not PUBLISHABLE
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            // ✅ This attaches Supabase cookies to the response
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // ✅ Exchanges the "code" from OAuth redirect into session cookies
    await supabase.auth.exchangeCodeForSession(code);
  }

  return response;
}
