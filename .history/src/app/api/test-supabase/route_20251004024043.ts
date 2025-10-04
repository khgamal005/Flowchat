import { NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabaseServerClient"; // adjust import path

export async function GET() {
  const supabase = await supabaseServerClient();

  // test auth
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return NextResponse.json({ user, error });
}
