import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // ✅ Create a mutable NextResponse
  const response = NextResponse.redirect(requestUrl.origin);

  if (code) {
    // ✅ We can read cookies, but to *set* them we must use response.cookies
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            // ok to just return the cookie store
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            // ✅ Set cookies on the *response* object so they persist in the browser
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    await supabase.auth.exchangeCodeForSession(code);
  }

  return response;
}
