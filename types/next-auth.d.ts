import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string
            isSystemAdmin?: boolean
            approval?: number
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        role: string
        isSystemAdmin?: boolean
        approval?: number
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: string
        isSystemAdmin?: boolean
        approval?: number
    }
}
