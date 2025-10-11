// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

export const ourFileRouter = {
  workspaceImage: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      // Get the authorization header instead of cookies
      const authHeader = req.headers.get('authorization');
      
      if (!authHeader?.startsWith('Bearer ')) {
        throw new Error('Unauthorized');
      }

      const token = authHeader.slice(7);
      
      // Verify the token with Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        throw new Error('Unauthorized');
      }

      return { userId: user.id };
    })
    .onUploadComplete(() => {}),
} satisfies FileRouter;