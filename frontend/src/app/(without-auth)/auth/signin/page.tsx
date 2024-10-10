"use client"

import React from "react"
import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/app/lib/AuthContext"
import { SignInFormState, SignInFormSchema } from "@/app/lib/definitions"
import CSRFToken from "@/components/Utils/CSRFToken"
import FortyTwoSigninButton from "@/components/buttons/FortyTwoSigninButton"


export default function SignIn() {
  const [pending, setPending] = useState(false);
  const [formState, setFormState] = useState<SignInFormState | undefined>(undefined);
  const {signIn} = useAuth()


  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    const formData = new FormData(event.currentTarget)
    const validatedFields = SignInFormSchema.safeParse({
      username: formData.get('username'),
      password: formData.get('password'),
    })
    if(!validatedFields.success)
      setFormState({errors: validatedFields.error.flatten().fieldErrors})
    else {
      const { username, password } = validatedFields.data;
      setFormState({message: signIn('credentials', username, password)})
    }
    setPending(false)
  }

    return (
      <>
        <div className="d-flex justify-content-center align-items-center p-5 m-5">
          <div className="card shadow-lg text-center rounded-4 border border-light border-1 border-opacity-25 bg-light bg-gradient bg-opacity-75">
            <div className="card-header fs-4 fw-bold">Sign in to your account</div>
            <div className="card-body">
              <FortyTwoSigninButton />
              <hr />
              <p className="fw-3 fw-bold ">Or</p>
              <form onSubmit={handleSubmit}>
                <CSRFToken />
                <div className="mb-3">
                  <label htmlFor="username" className="form-label fw-bold" >Username*</label>
                  <input 
                    type="text" 
                    name="username" 
                    id="username" 
                    className="form-control"
                  />
                  {formState?.errors?.username && <p className="mt-2 text-danger">{formState.errors.username}</p>}
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label fw-bold">Password*</label>
                  <input 
                    type="password" 
                    className="form-control"
                    id="password"
                    name="password"
                  />
                  {formState?.errors?.password && <p className="mt-2 text-danger">{formState.errors.password}</p>}
                </div>
                <SubmitButton pending={pending}/>
                {formState?.message && <p className="mt-2 text-danger">{formState.message}</p>}
              </form>
            </div>
            <div className="card-footer">
              <span>Not Registered Yet ? </span>
              <Link href="/auth/register">
                <button className="ms-2 btn btn-primary btn-sm">Register</button>
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  function SubmitButton({pending}: {pending: boolean}) {
    return (
      <button disabled={pending} type="submit" className="btn btn-dark fw-bold mt-2">
        {
          pending ? (
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (<span>Sign In</span>)
        }
      </button>
    )
  }


