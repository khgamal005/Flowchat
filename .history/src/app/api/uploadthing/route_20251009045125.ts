// app/api/uploadthing/route.ts
import { createRouteHandler } from "uploadthing/next";
import { OurFileRouter } from "./core";

// No authentication in upload callbacks to prevent token conflicts
export const { GET, POST } = createRouteHandler({
  router: export const ourFileRouter = {
,
});