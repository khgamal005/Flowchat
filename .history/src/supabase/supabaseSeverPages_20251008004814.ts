
import type { NextApiRequest, NextApiResponse } from "next";
import { createServerClient, serialize, type CookieOptions } from "@supabase/ssr";

export default function supabaseServerClientPages(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Return all cookies as an array { name, value }
        async getAll() {
          return Object.entries(req.cookies)
            .filter(([_, value]) => typeof value === "string")
            .map(([name, value]) => ({
              name,
              value: value as string,
            }));
        },

        // Accept an array of cookies to set
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.appendHeader("Set-Cookie", serialize(name, value, options));
          });
        },
      },
    }
  );

  return supabase;
}
