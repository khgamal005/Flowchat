import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Set the cookie in the response
          response.cookies.set({
            name,
            value,
            ...options,
            // Ensure same site and secure settings
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
          });
        },
        remove(name: string, options: CookieOptions) {
          // Remove the cookie by setting it to empty with expired date
          response.cookies.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          });
        },
      },
    }
  );

  try {
    // This will refresh the session and update cookies if needed
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('Auth error in middleware:', error.message);
    }
  } catch (error) {
    console.log('Middleware auth check failed:', error);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};