import { FormState, RegisterFormSchema } from '@/app/lib/definitions'
import { API_URL } from '@/config';

export async function register(state: FormData, formdata: FormData) {
  //validate form fields
  const validatedFields = RegisterFormSchema.safeParse({
    username: formdata.get('username'),
    email: formdata.get('email'),
    password: formdata.get('password'),
    rePass: formdata.get('rePass'),
  })

  // If any form fields are invalid, return an error
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
  const { username, email, password, rePass } = validatedFields.data;

  const response = await fetch(`${API_URL}/auth/register/`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      body: JSON.stringify({
        username,
        email,
        password,
        rePass
      })
    }
  })
  if (!response.ok) {
    return {
      message: 'An error occurred while creating your account.',
    }
  }
}