import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // First update the request cookies for subsequent middleware
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          
          // Then update the response cookies
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // IMPORTANT: Check if the current path is an UploadThing route
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/error') &&
    !request.nextUrl.pathname.startsWith('/api/uploadthing') // ← Add this line
  ) {
  const url = request.nextUrl.clone()
  url.pathname = '/auth'
  return NextResponse.redirect(url)
  }

  return response
}