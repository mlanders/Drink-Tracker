import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getDB, type DBUser } from "./db";
import { verifyPassword } from "./password";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const db = getDB();
        const user = await db
          .prepare("SELECT * FROM users WHERE email = ?")
          .bind(credentials.email)
          .first<DBUser>();

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await verifyPassword(
          credentials.password as string,
          user.password,
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          timezone: user.timezone,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.timezone = (user as any).timezone;
      }
      if (trigger === "update" && token.id) {
        const db = getDB();
        const dbUser = await db
          .prepare("SELECT timezone FROM users WHERE id = ?")
          .bind(token.id)
          .first<{ timezone: string }>();
        if (dbUser) {
          token.timezone = dbUser.timezone;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.timezone =
          (token.timezone as string) || "America/Los_Angeles";
      }
      return session;
    },
  },
});
