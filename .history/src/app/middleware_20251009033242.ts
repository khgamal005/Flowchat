import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // ✅ Start with a fresh response to allow setting cookies
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // ✅ Use getAll() to read cookies from the request
        getAll() {
          return request.cookies.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        // ✅ Use setAll() to write cookies to the response
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // ⚠️ Skip getUser() on heavy/static routes to avoid rate-limit spam
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith("/_next") && !pathname.startsWith("/api")) {
    await supabase.auth.getUser();
  }

  return response;
}

// 👇 Match only your main app routes
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
