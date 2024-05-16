"use client";

import "react"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import "bootstrap/dist/css/bootstrap.min.css"

export default function Register() {
  const [data, setData] = useState({
    login:'',
    email:'',
    password:'',
    rePass:''
  });
  const router = useRouter();

  async function registerUser(e: React.FormEvent<HTMLInputElement>) {
    e.preventDefault()
    const response = await fetch('http://localhost:8000/api/auth/register/', {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({data})
    })
    if(response.ok)
      router.push('/auth/signin')
  }

  return (
    <>  
      <div className="d-flex justify-content-center align-items-center">
        <div className="card shadow-lg text-center rounded-1 border-0">
          <div className="card-header fs-2 fw-bold">Register a new account</div>
          <div className="card-body">
            <button className="btn btn-dark fs-4 fw-bold"onClick={() => signIn('42-school')}>
            Register with
            <Image
                className="ms-1 me-1"
                src="/static/images/42.png"
                style={{filter: "invert(100%)"}}
                width={30}
                height={30}
                alt="42 Logo"
              />
            </button>
            <p className="mt-2">Or</p>
            <form onSubmit={registerUser}>
              <div className="mb-3">
                <label htmlFor="login" className="form-label" >Login</label>
                <input type="text" id="login" className="form-control" value={data.login} onChange={(e) => setData({...data, login: e.target.value})}/>
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label" >Email address</label>
                <input type="email" id="email" className ="form-control"value={data.email} onChange={(e) => setData({...data, email: e.target.value})}/>
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input type="password" className="form-control"value={data.password} onChange={(e) => setData({...data, password: e.target.value})}/>
              </div>
              <div className="mb-3">
                <label htmlFor="re-password" className="form-label">Confirm Password</label>
                <input type="password" className="form-control" value={data.rePass} onChange={(e) => setData({...data, rePass: e.target.value})}/>
              </div>
              <button type="submit" className="btn btn-dark fw-bold">Submit</button>
            </form>
          </div>
          <div className="card-footer">Already have an account ?
            <Link className="text-decoration-none"href="/auth/signin"> Sign In</Link>
          </div>
        </div>
      </div>
    </>
  )
}