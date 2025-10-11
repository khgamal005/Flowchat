// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const f = createUploadthing();

const authMiddleware = async () => {
  try {
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
            // Don't set cookies during upload
          },
        },
      }
    )

    // Use the standard getUser method
    const { data: { user }, error } = await supabase.auth.getUser()
    
    console.log('UploadThing Auth - User found:', !!user);
    console.log('UploadThing Auth - Error:', error);
    
    if (error) {
      console.error('Auth error:', error.message);
      throw new Error('Authentication failed');
    }
    
    if (!user) {
      throw new Error('Please sign in to upload files');
    }
    
    return { userId: user.id }
    
  } catch (error: any) {
    console.error('UploadThing middleware error:', error.message);
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

export type OurFileRouter = typeof ourFileRouter;