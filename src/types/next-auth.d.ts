import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/api-types";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: "RefreshAccessTokenError";
    user: DefaultSession["user"] & { id: string; role: Role };
  }

  interface User {
    id: string;
    role: Role;
    accessToken: string;
    refreshToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: "RefreshAccessTokenError";
  }
}
