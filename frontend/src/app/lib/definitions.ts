import { z } from 'zod'

interface FormSchema {
  username: string;
  password: string;
  rePass: string;
}

export const RegisterFormSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Username is required." })
    .max(9, { message: "Username must be less then 9 characters." })
    .trim(),
  password: z
    .string()
    .min(1, { message: 'Password is required.' })
    .trim(),
  rePass: z
    .string()
    .trim()
}).refine((data: FormSchema) => data.password === data.rePass, {
  message: "Passwords don't match",
  path: ["rePass"],
});

export const SignInFormSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Username is required." })
    .trim(),
  password: z
    .string()
    .min(1, { message: 'Password is required.' })
    .trim(),
});

export type SignInFormState =
  | {
    errors?: {
      username?: string[];
      password?: string[];
    }
    message?: string[]
  }
  | undefined


export type RegisterFormState =
  | {
    errors?: {
      username?: string[];
      password?: string[];
      rePass?: string[];
    }
    message?: string[]
  }
  | undefined