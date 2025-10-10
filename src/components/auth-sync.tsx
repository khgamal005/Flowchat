// // components/auth-sync.tsx
// "use client";

// import { createClient } from "@supabase/supabase-js";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

// export function AuthSync() {
//   const router = useRouter();
  
//   const supabase = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//   );

//   useEffect(() => {
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((event, session) => {
//       console.log('Auth state changed:', event);
      
//       // Refresh server components when auth changes
//       if (["SIGNED_IN", "TOKEN_REFRESHED", "SIGNED_OUT"].includes(event)) {
//         router.refresh();
//       }
//     });

//     return () => subscription.unsubscribe();
//   }, [supabase, router]);

//   return null;
}