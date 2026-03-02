import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "repo read:user user:email",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.userId = user?.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId as string;
      session.accessToken = token.accessToken as string;

      // Sync accessToken to DB when it changes
      if (token.accessToken && session.user.id) {
        await db.user
          .update({
            where: { id: session.user.id },
            data: { accessToken: token.accessToken as string },
          })
          .catch(() => {
            // Ignore if user doesn't exist yet
          });
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
