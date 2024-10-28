import { z } from 'zod'

interface FormSchema {
  username: string;
  password: string;
  rePass: string;
}

export const RegisterFormSchema = z.object({
  username: z
    .string()
    .max(9, { message: "*Username must be less then 9 characters." })
    .regex(/^[a-zA-Z0-9]*$/, { message: "*Username contains forbidden characters." })
    .trim(),
  password: z
    .string()
    .min(8, { message: "*Must contain at least 8 characters" })
    .regex(/[A-Z]/, { message: "*Must contain at least one uppercase letter." })
    .regex(/[0-9]/, { message: "*Must contain at least one digit." })
    .trim(),
  rePass: z
    .string()
    .trim()
}).refine((data: FormSchema) => data.password === data.rePass, {
  message: "*Password do not match",
  path: ["rePass"],
});

export const SignInFormSchema = z.object({
  username: z
    .string()
    .min(1, { message: "*Username is required." })
    .trim(),
  password: z
    .string()
    .min(1, { message: '*Password is required.' })
    .trim(),
});

export type RegisterFormState =
  | {
    errors?: {
      username?: string[];
      password?: string[];
      rePass?: string;
    }
    message?: string[]
  }
  | undefined