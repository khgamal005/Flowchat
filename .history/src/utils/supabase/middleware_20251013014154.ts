// middleware.ts
// import { createServerClient } from '@supabase/ssr'
// import { NextResponse, type NextRequest } from 'next/server'

// export async function updateSession(request: NextRequest) {
//   let supabaseResponse = NextResponse.next({
//     request,
//   })

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return request.cookies.getAll()
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
//           supabaseResponse = NextResponse.next({
//             request,
//           })
//           cookiesToSet.forEach(({ name, value, options }) =>
//             supabaseResponse.cookies.set(name, value, options)
//           )
//         },
//       },
//     }
//   )

//   // Handle OTP callback - exchange code for session
//   const { searchParams } = request.nextUrl
//   const code = searchParams.get('code')
  
//   if (code) {
//     const { error } = await supabase.auth.exchangeCodeForSession(code)
//     if (!error) {
//       // Remove code from URL after successful exchange
//       const url = request.nextUrl.clone()
//       url.searchParams.delete('code')
//       return NextResponse.redirect(url)
//     }
//   }

//   const {
//     data: { user },
//   } = await supabase.auth.getUser()

//   // Exclude these routes from auth redirect
//   if (
//     !user &&
//     !request.nextUrl.pathname.startsWith('/auth') &&
//     !request.nextUrl.pathname.startsWith('/error') &&
//     !request.nextUrl.pathname.startsWith('/api/uploadthing') &&
//     !request.nextUrl.pathname.startsWith('/create-workspace')
//   ) {
//     const url = request.nextUrl.clone()
//     url.pathname = '/auth'
//     return NextResponse.redirect(url)
//   }

//   return supabaseResponse
// }

