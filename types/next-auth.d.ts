import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      timezone: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    timezone?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    timezone?: string;
  }
}
