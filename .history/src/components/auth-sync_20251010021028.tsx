// components/auth-sync.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthSync() {
  const supabase = createClientComponentClien();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return null;
}