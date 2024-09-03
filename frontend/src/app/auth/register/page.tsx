"use client";

import "react"
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from 'next-auth/react'
import Link from "next/link"
import "bootstrap/dist/css/bootstrap.min.css"
import DOMPurify from 'dompurify'
import { BASE_URL } from "@/utils/constants";

export default function Register() {
  const { data: session } = useSession()
  const [data, setData] = useState({
    username: '',
    email: '',
    password: '',
    rePass: ''
  });
  const [error, setError] = useState<string | null>(null)
  const router = useRouter();

  async function registerUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    try {
      const response = await fetch(BASE_URL + 'auth/register/', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data })
      })
      const res = await response.json()
      if (!response.ok) {
        throw new Error(res.message)
      }
      else (
        router.push('/auth/signin')
      )
    }
    catch (error: any) {
      setError(error.message)
    }
  }
  if (session) {
    router.push('/')
  }
  else {
    return (
      <>
        <div className="d-flex justify-content-center align-items-center p-5 m-5">
          <div className="card shadow-lg text-center rounded-4 border border-light border-1 border-opacity-25 bg-light bg-gradient bg-opacity-75">
            <div className="card-header fs-2 fw-bold">Register a new account</div>
            <div className="card-body">
              <form onSubmit={registerUser}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label" >
                    Username
                    <span className="text-danger">*</span>
                  </label>
                  <input type="text" id="username" className="form-control" value={data.username} onChange={(e) => setData({ ...data, username: DOMPurify.sanitize(e.target.value) })} />
                  <div className="form-text">A unique username that will be displayed to other players</div>
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label" >
                    Email address
                    <span className="text-danger">*</span>
                  </label>
                  <input type="email" id="email" className="form-control" value={data.email} onChange={(e) => setData({ ...data, email: DOMPurify.sanitize(e.target.value) })} />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                    <span className="text-danger">*</span>
                  </label>
                  <input type="password" className="form-control" value={data.password} onChange={(e) => setData({ ...data, password: DOMPurify.sanitize(e.target.value) })} />
                </div>
                <div className="mb-3">
                  <label htmlFor="re-password" className="form-label">
                    Confirm Password
                    <span className="text-danger">*</span>
                  </label>
                  <input type="password" className="form-control" value={data.rePass} onChange={(e) => setData({ ...data, rePass: DOMPurify.sanitize(e.target.value) })} />
                </div>
                <div className="form-text text-danger mb-2">{error}</div>
                <button type="submit" className="btn btn-dark fw-bold">Submit</button>
              </form>
            </div>
            <div className="card-footer">
              <span>Already have an account ?</span>
              <Link href="/auth/signin">
                <button className="ms-2 btn btn-primary btn-sm">Sign In</button>
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }
}