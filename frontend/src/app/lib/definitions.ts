import { z } from 'zod'

interface FormSchema {
  username: string;
  password: string;
  rePass: string;
}

export const RegisterFormSchema = z.object({
  username: z
    .string()
    .max(8, { message: "*Username must be less then 8 characters." })
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

export const ChangeUsernameFormSchema = z.object({
  username: z
    .string()
    .max(8, { message: "*Username must be less then 8 characters." })
    .regex(/^[a-zA-Z0-9]*$/, { message: "*Username contains forbidden characters." })
    .trim(),
})

export type ChangeUsernameFormState =
  | {
    errors?: {
      username?: string[];
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