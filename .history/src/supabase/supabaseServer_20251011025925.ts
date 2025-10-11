// lib/uploadthing-auth.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const getUploadThingUser = async () => {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // No-op for UploadThing context
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  return user
}