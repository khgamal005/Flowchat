import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const cookieStore = await cookies();

  // create server client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    console.error("Supabase exchange error:", error);
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  // ✅ Return a response that includes cookies
  const res = NextResponse.redirect(origin);
  const newCookies = cookieStore.getAll();
  newCookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options));

  console.log("✅ User logged in:", data.session.user.id);
  return res;
}
