"use client";

import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next"
import "bootstrap/dist/css/bootstrap.min.css"
import { getProviders, signIn, getCsrfToken } from "next-auth/react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/options"
import Image from "next/image"
import Link from "next/link"
import {useState} from "react"

export default function SignIn({
  providers,
  csrfToken
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [inputMail, setInputMail] = useState<string>("")
  const [inputPass, setInputPass] = useState<string>("")
  const fortyTwo = providers['42-school']
  return (
    <>  
      <div className="d-flex justify-content-center align-items-center">
        <div className="card shadow-lg text-center rounded-1 border-0">
          <div className="card-header fs-2 fw-bold">Sign in to your account</div>
          <div className="card-body">
            <button className="btn btn-dark  fs-4 fw-bold"onClick={() => signIn(fortyTwo.id)}>
            Sign in with
            <Image
                className="ms-1 me-1"
                src="/static/images/42.png"
                style={{filter: "invert(100%)"}}
                width={30}
                height={30}
                alt="42 Logo"
              />
            </button>
            <p>Or</p>
            <form method="post" action="/api/auth/callback/credentials">
            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
              <div className="mb-3">
                <label htmlFor="email" className="form-label" >Email address</label>
                <input type="email" id="email" className ="form-control"value={inputMail} onChange={(e) => setInputMail(e.target.value)}/>
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input type="password" className="form-control"value={inputPass} onChange={(e) => setInputPass(e.target.value)}/>
              </div>
              <button type="submit" className="btn btn-dark fw-bold" onClick={() => signIn("credentials", {email: inputMail, password: inputPass})} >Submit</button>
            </form>
          </div>
          <div className="card-footer">Not Registered Yet ? 
            <Link className="text-decoration-none"href="/signup"> Sign Up</Link>
          </div>
        </div>
      </div>
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions)
  const csrfToken = await getCsrfToken(context)

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: "/" } }
  }

  const providers = await getProviders()

  return {
    props: { providers: providers ?? [], csrfToken },
  }
}