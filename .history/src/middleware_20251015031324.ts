import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Create a response object — must be reused
  const response = NextResponse.next();

  // ✅ Use the new API (non-deprecated)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // use ANON, not publishable
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set(name, value, options);
        },
        remove(name, options) {
          response.cookies.set(name, "", options);
        },
      },
    }
  );

  // ✅ Optionally check if user exists
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Example: redirect if not logged in
  if (!user && request.nextUrl.pathname !== "/auth") {
    const redirectUrl = new URL("/auth", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // ✅ Always return the same response Supabase mutated
  return response;
}

export const config = {
  matcher: [
    // Run on all routes except static/assets
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
