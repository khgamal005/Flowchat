import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const f = createUploadthing();

export const ourFileRouter = {
  workspaceImage: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(async () => {
      // ✅ Create Supabase client using request cookies
      const supabase = createRouteHandlerClient({ cookies });
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Unauthorized');

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('✅ Upload complete', { userId: metadata.userId, file });

      // Example: You could save file URL in your DB here
      // await db.workspaces.update({ imageUrl: file.url }).where({ userId: metadata.userId });
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
