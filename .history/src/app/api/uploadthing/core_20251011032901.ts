// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const f = createUploadthing();

const authenticateUser = async (req: Request) => {
  try {
    // First try to get from cookies (for regular requests)
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set() {}, // No-op for auth check
          remove() {}, // No-op for auth check
        },
      }
    );

    // Also check for authorization header
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      // Verify the token
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (user && !error) return user;
    }

    // Fallback to cookie-based auth
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
};

export const ourFileRouter = {
  workspaceImage: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const user = await authenticateUser(req);
      
      if (!user) {
        throw new Error('Unauthorized');
      }

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload completed for user:', metadata.userId);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;