// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const f = createUploadthing();

const authMiddleware = async () => {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // Don't set cookies in middleware
        },
        remove(name: string, options: any) {
          // Don't remove cookies in middleware
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')
  
  return { userId: user.id }
}

export const ourFileRouter = {
  workspaceImage: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(authMiddleware)
    .onUploadComplete(({ metadata }) => {
      console.log('Upload complete for user:', metadata.userId);
    }),
} satisfies FileRouter;