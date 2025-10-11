// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { getUserData } from '@/actions/get-user-data';

const f = createUploadthing();

export const ourFileRouter = {
  workspaceImage: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(async () => {
      const user = await getUserData();
      
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