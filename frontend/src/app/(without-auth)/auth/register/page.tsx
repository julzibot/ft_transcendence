"use client"

import React from "react";
import Link from "next/link"
import { RegisterFormSchema, RegisterFormState } from "@/app/lib/definitions"
import { useState } from "react"
import { BACKEND_URL } from '@/config';
import { useRouter } from 'next/navigation'
import CSRFToken from "@/components/Utils/CSRFToken";
import Cookies from 'js-cookie'

export default function RegisterForm() {
  const [pending, setPending] = useState(false);
  const [formState, setFormState] = useState<RegisterFormState | undefined>(undefined);
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    const formData = new FormData(event.currentTarget)

    const validatedFields = RegisterFormSchema.safeParse({
      username: formData.get('username'),
      password: formData.get('password'),
      rePass: formData.get('rePass'),
    })
    if (!validatedFields.success) {
      setFormState({ errors: validatedFields.error.flatten().fieldErrors })
    }
    else {
      const { username, password, rePass } = validatedFields.data;
      const response = await fetch(`${BACKEND_URL}/api/auth/register/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': Cookies.get('csrftoken') as string,
        },
        body: JSON.stringify({
          username,
          password,
          rePass,
        }),
      });
      if (response.status === 201)
        router.push('/auth/signin')
      const data = await response.json()
      setFormState({ message: data.error })
    }
    setPending(false)
  }

  return (
    <>
      <div className="d-flex justify-content-center align-items-center p-5 m-5">
        <div className="card shadow-lg text-center rounded-4 border border-light border-1 border-opacity-25 bg-light bg-gradient bg-opacity-75">
          <div className="card-header fs-2 fw-bold">Register a new account</div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <CSRFToken />
              <div className="mb-1 form-group">
                <label htmlFor="username" className="form-label" >
                  <strong>Username*</strong>
                </label>
                <input
                  required
                  type="text"
                  name="username"
                  id="username"
                  className="form-control"
                />
                <p className="form-text fst-italic ">A unique username that will be displayed to other players</p>
                {formState?.errors?.username && formState?.errors?.username.map((error, index) => (
                  <div className="form-label" key={index} className="text-danger">{error}</div>)
                )}
              </div>
              <div className="mb-3 form-group">
                <label htmlFor="password" className="form-label">
                  <strong>Password*</strong>
                </label>
                <input
                  required
                  type="password"
                  name="password"
                  id="password"
                  className="form-control"
                />
                {formState?.errors?.password && formState?.errors?.password.map((error, index) => (
                  <div key={index} className="text-danger">{error}</div>)
                )}
              </div>
              <div className="mb-3 form-group">
                <label htmlFor="re-password" className="form-label">
                  <strong>Confirm Password*</strong>
                </label>
                <input
                  required
                  type="password"
                  name="rePass"
                  id="rePass"
                  className="form-control"
                />
                {formState?.errors?.rePass && <p className="text-danger">{formState.errors.rePass}</p>}
              </div>
              {formState?.message && <p className="text-danger">{formState.message}</p>}
              <SubmitButton pending={pending} />
            </form>
          </div>
          <div className="card-footer">
            <span>Already have an account ?</span>
            <Link href="/auth/signin">
              <button className="ms-2 btn btn-primary btn-sm">Sign In</button>
            </Link>
          </div>
        </div >
      </div >
    </>
  )
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button disabled={pending} type="submit" className="btn btn-dark fw-bold mt-2">
      {
        pending ? (
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (<span>Register</span>)
      }
    </button>
  )
}
