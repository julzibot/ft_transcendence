import nextAuth from "next-auth";

declare module "next-auth"{

  interface Session extends NextAuthSession {
    user: {
      id: number;
      username: string;
      email: string;
      image: string;
    };
    provider?: string | unknown
  }
}
import { JWT } from "next-auth/jwt";

declare module "next-auth/jwt" {

  interface JWT{
    user: {
      id: number;
      username: string;
      email: string;
      image: string;
    };
    backendTokens: {
      access: string;
      refresh: string;
      expiresIn: number;
    };
    provider?: string | unknown
  }
}