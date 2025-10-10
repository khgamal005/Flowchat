// app/api/uploadthing/route.ts
import { createReadOnlyClient } from '@/supabase/supabaseServer';
import { createRouteHandler } from "uploadthing/next";
import { OurFileRouter } from "./core";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  
  // Add authentication check
  async onUploadComplete({ metadata, file }) {
    try {
      const supabase = await createReadOnlyClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No session during upload');
        return;
      }
      
      console.log('Upload completed for user:', session.user.id);
    } catch (error) {
      console.log('Upload callback error:', error);
    }
  },
});