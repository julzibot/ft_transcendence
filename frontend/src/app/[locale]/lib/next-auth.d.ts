import nextAuth from "next-auth";

declare module "next-auth"{

  interface Session{
    user: {
      id: number;
      name: string;
      email: string;
    };
    backendTokens: {
      accessToken: string;
      refreshToken:string;
    };
  }
}

import { JWT } from "next-auth/jwt";

declare module "next-auth/jwt" {

  interface JWT{
    user: {
      id: number;
      name: string;
      email: string;
    };
    backendTokens: {
      accessToken: string;
      refreshToken:string;
    };
  }
}