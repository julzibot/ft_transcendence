import dotenv from 'dotenv'

dotenv.config();

export const BACKEND_URL: string = process.env.NEXT_PUBLIC_API_URL as string;
export const FORTY_TWO_CLIENT_UID: string = process.env.NEXT_PUBLIC_FORTY_TWO_CLIENT_UID as string;
export const DOMAIN_NAME: string = process.env.NEXT_PUBLIC_DOMAIN as string;
export const SESSION_SECRET: string = process.env.NEXT_PUBLIC_SESSION_SECRET as string;
export const FORTY_TWO_CLIENT_SECRET: string = process.env.NEXT_PUBLIC_FORTY_TWO_CLIENT_SECRET as string;
export const NEXT_PUBLIC_URL: string = process.env.NEXT_PUBLIC_URL as string;

export const FRONTEND_PORT: string = process.env.NEXT_PUBLIC_FRONTEND_PORT as string;
export const BACKEND_PORT: string = process.env.NEXT_PUBLIC_BACKEND_PORT as string;
export const SOCKET_PORT: string = process.env.NEXT_PUBLIC_SOCKET_PORT as string;