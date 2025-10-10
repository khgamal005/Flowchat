// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { createClient } from '@/supabase/supabaseServer';

const f = createUploadthing();

// Get authenticated user for UploadThing
const getAuthUser = async () => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    console.log('UploadThing - User auth check:', user?.id);
    
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    return user;
  } catch (error) {
    console.error('UploadThing - Auth error:', error);
    throw new Error('Authentication failed');
  }
};

export const ourFileRouter = {
  workspaceImage: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(async () => {
      // Authenticate user before allowing upload
      const user = await getAuthUser();
      
      console.log('UploadThing middleware - Authenticated user:', user.id);
      
      return { 
        userId: user.id,
        userEmail: user.email 
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code runs after successful upload
      console.log('Upload completed for user:', metadata.userId);
      console.log('File URL:', file.url);
      console.log('File name:', file.name);
      
      // You can also save the file info to your database here
      try {
        const supabase = await createClient();
        
        // Optional: Save file info to your database
        // const { error } = await supabase
        //   .from('uploads')
        //   .insert({
        //     user_id: metadata.userId,
        //     file_url: file.url,
        //     file_name: file.name,
        //     file_size: file.size,
        //     uploaded_at: new Date().toISOString(),
        //   });
        // 
        // if (error) {
        //   console.error('Failed to save upload record:', error);
        // }
        
      } catch (dbError) {
        console.error('Database operation failed:', dbError);
      }
      
      return { 
        url: file.url,
        uploadedBy: metadata.userId 
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;