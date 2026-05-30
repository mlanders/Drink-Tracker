export type SafeUser = {
  id: string;
  email: string;
  name: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
    };
  }
}
