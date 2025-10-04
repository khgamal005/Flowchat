import { supabaseServerClient } from "@/supabase/supabaseServer";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await supabaseServerClient();

  // test auth
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return NextResponse.json({ user, error });
}
