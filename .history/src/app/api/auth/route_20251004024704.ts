console.log("hello")
import { supabaseServerClient } from "@/supabase/supabaseServer";
import { NextResponse } from "next/server";

export async function GET() {


  return NextResponse.json({ user, error });
}
