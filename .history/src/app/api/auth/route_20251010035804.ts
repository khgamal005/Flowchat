import { createClient } from "@/supabase/supabaseServer";
import { NextResponse } from "next/server";

// Handle GET requests (example: test Supabase connection)
export async function GET() {
     console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("SUPABASE_KEY:", process.env.SUPABASE_PUBLISHABLE_KEY);

    const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user });
}

// Handle POST requests (example: sign up with email + password)
export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_CURRENT_ORIGIN + "/auth/callback",
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}
