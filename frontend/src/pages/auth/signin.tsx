"use client";

import "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation";
import Image from "next/image"
import Link from "next/link"
import {useState} from "react"
import "bootstrap/dist/css/bootstrap.min.css"

export default function SignIn() {
  const [data, setData] = useState({
    login:'',
    email:'',
    password:''
  });
  const router = useRouter();

  async function loginUser(e: React.FormEvent<HTMLInputElement>) {
    e.preventDefault();
    signIn('credentials', {
      ...data,
      redirect: true,
      callbackUrl: '/'
      }
    )
    // router.push('/')
  }
  return (
    <>  
      <div className="d-flex justify-content-center align-items-center">
        <div className="card shadow-lg text-center rounded-1 border-0">
          <div className="card-header fs-2 fw-bold">Sign in to your account</div>
          <div className="card-body">
            <button className="btn btn-dark  fs-4 fw-bold"onClick={() => signIn('42-school', {
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
              />
            </button>
            <p>Or</p>
            <form onSubmit={loginUser}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label" >Email address</label>
                <input type="email" id="email" className ="form-control" value={data.email} onChange={(e) => setData({...data, email:e.target.value})}/>
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input type="password" className="form-control" value={data.password} onChange={(e) => setData({...data, password:e.target.value})}/>
              </div>
              <button type="submit" className="btn btn-dark fw-bold">Submit</button>
            </form>
          </div>
          <div className="card-footer">Not Registered Yet ? 
            <Link className="text-decoration-none"href="/auth/register"> Register</Link>
          </div>
        </div>
      </div>
    </>
  )
}