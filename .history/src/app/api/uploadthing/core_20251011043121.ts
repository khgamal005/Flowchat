// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const f = createUploadthing();

const authMiddleware = async () => {
  try {
    const cookieStore = await cookies()
    
    // Look for the specific Supabase cookies
    const accessToken = cookieStore.get('sb-access-token')?.value
    const refreshToken = cookieStore.get('sb-refresh-token')?.value
    
    console.log('Supabase tokens found:', { 
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken 
    });

    if (!accessToken) {
      throw new Error('No access token found');
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set() {},
          remove() {},
        },
      }
    )

    // Verify the token directly
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (error || !user) {
      throw new Error('Invalid token');
    }
    
    return { userId: user.id }
  } catch (error) {
    console.error('Auth middleware error:', error);
    throw new Error('Please sign in to upload files');
  }
}

export const ourFileRouter = {
  workspaceImage: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(authMiddleware)
    .onUploadComplete(({ metadata }) => {
      console.log('Upload complete for user:', metadata.userId);
      return { userId: metadata.userId };
    }),
} satisfies FileRouter;