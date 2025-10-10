// debug-cookies.ts
"use server";

import { cookies } from "next/headers";

export async function debugCookies() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  console.log('All cookies:', allCookies);
  
  const supabaseCookies = allCookies.filter(cookie => 
    cookie.name.includes('supabase') || 
    cookie.name.includes('sb-')
  );
  
  console.log('Supabase cookies:', supabaseCookies);
  
  return supabaseCookies;
}