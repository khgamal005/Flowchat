"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function supabaseServerClient() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll().map((c) => ({
            name: c.name,
            value: c.value,
          }));
        },
        // 👇 Only read mode
        setAll() {}, 
      },
    }
  );

  return supabase;
}
