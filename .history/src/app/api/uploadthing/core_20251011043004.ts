// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const f = createUploadthing();

const authMiddleware = async () => {
  try {
    const cookieStore = await cookies()
    
    console.log('Available cookies:', cookieStore.getAll().map(c => c.name));
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {
            // No-op - don't modify cookies during upload
          },
        },
      }
    )

    // Try to get the user
    const { data: { user }, error } = await supabase.auth.getUser()
    
    console.log('UploadThing Auth - User:', user?.id);
    console.log('UploadThing Auth - Error:', error);
    
    if (error) {
      console.error('Auth error in UploadThing:', error.message);
      throw new Error('Authentication failed: ' + error.message);
    }
    
    if (!user) {
      throw new Error('Please sign in to upload images');
    }
    
    return { userId: user.id }
  } catch (error) {
    console.error('Middleware error:', error);
    throw new Error('Authentication failed');
  }
}

export const ourFileRouter = {
  workspaceImage: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(authMiddleware)
    .onUploadComplete(({ metadata, file }) => {
      console.log('Upload complete for user:', metadata.userId, 'File:', file.name);
      return { userId: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;