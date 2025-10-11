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
    .onUploadComplete(({ metadata, file }) => {
      console.log('Upload complete:', { userId: metadata.userId, file });
      // You can store file URL or update DB here if needed
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
