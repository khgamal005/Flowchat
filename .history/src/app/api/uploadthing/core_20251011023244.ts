import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const f = createUploadthing();

export const ourFileRouter = {
  workspaceImage: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(async () => {
      // ✅ Create Supabase server client
      const cookieStore = cookies();

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                );
              } catch {
                // safe to ignore
              }
            },
          },
        }
      );

      // ✅ Get current user
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error('❌ UploadThing middleware: Unauthorized', error);
        throw new Error('Unauthorized');
      }

      // ✅ Return userId for later use
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('✅ Upload complete:', {
        userId: metadata.userId,
        fileUrl: file.url,
      });

      // Example: you could update user/workspace record here:
      // const supabase = createClient();
      // await supabase.from('workspaces')
      //   .update({ imageUrl: file.url })
      //   .eq('userId', metadata.userId);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
