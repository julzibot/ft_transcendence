import { z } from 'zod'

export const RegisterFormSchema = z.object({
  username: z
    .string()
    .max(9, { message: "Username must be less then 9 characters." })
    .trim(),
  email: z
    .string()
    .email({ message: 'Please enter a valid email.' })
    .trim(),
  password: z
    .string()
    .min(4, { message: 'Be at least 4 characters long.' })
    .trim(),
  repass: z
    .string()
    .trim()
})
  .refine((data) => data.password === data.rePass, {
    message: "Passwords don't match",
    path: ["rePass"],
  });

export type FormState =
  | {
    errors?: {
      username?: string[];
      email?: string[];
      password?: string[];
      rePass?: string[];
    }
    message?: string[]
  }
  | undefined