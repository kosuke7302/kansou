import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/lib/db";
import { userProfiles } from "@kansou/db";
import { eq } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      if (account) token.uid = account.providerAccountId;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid as string;
        const [profile] = await db
          .select({ nickname: userProfiles.nickname })
          .from(userProfiles)
          .where(eq(userProfiles.userId, session.user.id))
          .limit(1);
        if (profile?.nickname) session.user.name = profile.nickname;
      }
      return session;
    },
  },
});
