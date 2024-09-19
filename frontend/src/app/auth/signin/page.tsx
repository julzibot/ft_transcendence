"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from 'next/navigation'
import { SignInFormState, SignInFormSchema } from "@/app/lib/definitions"
import { API_URL } from "@/config"
import CSRFToken from "@/components/Utils/CSRFToken"
import Cookies from 'js-cookie'


export default function SignIn() {
  const [pending, setPending] = useState(false);
  const [formState, setFormState] = useState<SignInFormState | undefined>(undefined);
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
      const response = await fetch(`${API_URL}/auth/signin/`, {
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
        }),
      });
      if(response.ok) {
        router.push('/')
      }
      else {
        const data = await response.json()
        setFormState({message: data.message})
      }
    }
    setPending(false)
  }

    return (
      <>
        <div className="d-flex justify-content-center align-items-center p-5 m-5">
          <div className="card shadow-lg text-center rounded-4 border border-light border-1 border-opacity-25 bg-light bg-gradient bg-opacity-75">
            <div className="card-header fs-4 fw-bold">Sign in to your account</div>
            <div className="card-body">
              <button className="btn btn-dark mb-1 fs-4 " onClick={() => console.log('click')}>
                Sign in with
                <Image
                  className="ms-1 me-1"
                  src="/static/images/42.png"
                  style={{ filter: "invert(100%)" }}
                  width={30}
                  height={30}
                  alt="42 Logo"
                  fetchPriority="high"
                />
              </button>
              <hr />
              <p className="fw-3 fw-bold ">Or</p>
              <form onSubmit={handleSubmit}>
                <CSRFToken />
                <div className="mb-3">
                  <label htmlFor="username" className="form-label" >Username</label>
                  <input 
                    type="text" 
                    name="username" 
                    id="username" 
                    className="form-control"
                  />
                  {formState?.errors?.username && <p>{formState.errors.username}</p>}
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input 
                    type="password" 
                    className="form-control"
                    id="password"
                    name="password"
                  />
                  {formState?.errors?.password && <p>{formState.errors.password}</p>}
                </div>
                <SubmitButton pending={pending}/>
                {formState?.message && <p>{formState.message}</p>}
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


