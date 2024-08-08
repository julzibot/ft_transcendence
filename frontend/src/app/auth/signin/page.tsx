"use client"

import { signIn } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useState, FormEvent } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import DOMPurify from 'dompurify'


export default function SignIn() {
  const [data, setData] = useState({
    email:'',
    password:''
  });

  const [error, setError] = useState<string | null>(null)

  async function loginUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const result = await signIn('credentials', {
      ...data,
      callbackUrl: "/"
    })
    if(!result?.ok)
      setError("Authentication failed, please check your credentials.")
  }
  return (
    <>
      <div className="d-flex justify-content-center align-items-center p-5 m-5">
        <div className="card shadow-lg text-center rounded-4 border border-light border-1 border-opacity-25 bg-light bg-gradient bg-opacity-75">
          <div className="card-header fs-4 fw-bold">Sign in to your account</div>
          <div className="card-body">
            <button className="btn btn-dark mb-1 fs-4 "onClick={() => signIn('42-school', {
              redirect: true,
              callbackUrl: "/"
            })}>
            Sign in with
            <Image
              className="ms-1 me-1"
              src="/static/images/42.png"
              style={{filter: "invert(100%)"}}
              width={30}
              height={30}
              alt="42 Logo"
              fetchPriority="high"
            />
            </button>
            <hr />
            <p className="fw-3 fw-bold ">Or</p>
            <form onSubmit={loginUser}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label" >Email or Username</label>
                <input type="text" id="text" className ="form-control" value={data.email} onChange={(e) => setData({...data, email:DOMPurify.sanitize(e.target.value)})}/>
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input type="password" className="form-control" value={data.password} onChange={(e) => setData({...data, password:DOMPurify.sanitize(e.target.value)})}/>
              </div>
              <div className="form-text text-danger">{error}</div>
              <button type="submit" className="btn btn-dark   ">Submit</button>
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
