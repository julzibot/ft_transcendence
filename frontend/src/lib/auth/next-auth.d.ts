import nextAuth from "next-auth";

declare module "next-auth"{

  interface Session{
    user: {
      id: number;
      login: string;
      nick_name: string;
      email: string;
      image: string;
    };
  }
}

import { JWT } from "next-auth/jwt";

declare module "next-auth/jwt" {

  interface JWT{
    user: {
      id: number;
      login: string;
      nick_name: string;
      email: string;
      image: string;
    };
    backendTokens: {
      access: string;
      refresh: string;
      expiresIn: number;
    };
  }
}