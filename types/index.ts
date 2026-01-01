import { User } from "@prisma/client"

export type SafeUser = Omit<User, "password">

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
    }
  }
}
