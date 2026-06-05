import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ user: session.user });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  return NextResponse.json({ error: "Use the auth page to sign in" }, { status: 400 });
}
