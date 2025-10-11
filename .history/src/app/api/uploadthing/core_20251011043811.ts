// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { createClient } from '@/supabase/supabaseServer';

const f = createUploadthing();

export const ourFileRouter = {
  workspaceImage: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(async () => {
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('Not authenticated');
        }
        
        console.log('UploadThing - Authenticated user:', user.id);
        return { userId: user.id };
        
      } catch (error) {
        console.error('UploadThing auth error:', error);
        throw new Error('Authentication required');
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload completed for user:', metadata.userId);
      console.log('File URL:', file.url);
      
      return { 
        url: file.url,
        uploadedBy: metadata.userId 
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;