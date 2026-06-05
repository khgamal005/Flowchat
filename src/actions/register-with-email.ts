'use server';

import { signIn } from "@/auth";

export async function registerWithEmail({ email }: { email: string }) {
  try {
    await signIn("resend", {
      email,
      redirectTo: "/",
    });
    return JSON.stringify({ data: { email }, error: null });
  } catch (error) {
    return JSON.stringify({ error: "Failed to send magic link" });
  }
}
