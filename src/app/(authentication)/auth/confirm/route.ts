import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = '/';
  return NextResponse.redirect(redirectTo);
}
