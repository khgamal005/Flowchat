import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          avatarUrl: profile.picture,
        };
      },
      account(account) {
        return {
          accessToken: account.access_token,
          idToken: account.id_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
          scope: account.scope,
          tokenType: account.token_type,
          sessionState: account.session_state,
        };
      },
    }),
    GitHub({
      profile(profile) {
        return {
          id: profile.id?.toString(),
          name: profile.name ?? profile.login,
          email: profile.email,
          avatarUrl: profile.avatar_url,
        };
      },
      account(account) {
        return {
          accessToken: account.access_token,
          idToken: account.id_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
          scope: account.scope,
          tokenType: account.token_type,
          sessionState: account.session_state,
        };
      },
    }),
    Resend({
      from: process.env.AUTH_EMAIL_FROM || "noreply@slackzz.com",
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth",
  },
  trustHost: true,
});
