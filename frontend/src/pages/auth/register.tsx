"use client";

import "react"
import { useState, FormEvent } from "react";
import { getSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import { useRouter } from "next/navigation";
import Link from "next/link"
import "bootstrap/dist/css/bootstrap.min.css"
import DOMPurify from 'dompurify'

export default function Register() {
  const [data, setData] = useState({
    nick_name: '',
    email:'',
    password:'',
    rePass:''
  });
  const [error, setError] = useState<string | null>(null)
  const router = useRouter();

  async function registerUser(e: FormEvent<HTMLInputElement>) {
    e.preventDefault()
    setError(null)

    try {
      const response = await fetch('http://localhost:8000/api/auth/register/', {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({data})
      })
      const res = await response.json()
      if(!response.ok) {
        throw new Error(res.message)
      }
      else(
        router.push('/auth/signin')
      )
    } 
    catch(error) {
      setError(error.message)
    }
  }

  return (
    <> 
      <div className="position-fixed">
        <video className="object-fit-scale" src="/static/videos/background2.mp4" autoPlay loop muted />
      </div>
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="card shadow-lg text-center rounded-4 border border-light border-1 border-opacity-25 bg-light bg-gradient bg-opacity-50">
          <div className="card-header fs-2 fw-bold">Register a new account</div>
          <div className="card-body">
            <form onSubmit={registerUser}>
              <div className="mb-3">
                <label htmlFor="nick-name" className="form-label" >
                  Nick Name
                  <span className="text-danger">*</span>
                </label>
                <input type="text" id="nick-name" className ="form-control"value={data.nick_name} onChange={(e) => setData({...data, nick_name: DOMPurify.sanitize(e.target.value)})}/>
                <div className="form-text">Will be displayed to other players</div>
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label" >
                  Email address
                  <span className="text-danger">*</span>
                </label>
                <input type="email" id="email" className ="form-control"value={data.email} onChange={(e) => setData({...data, email: DOMPurify.sanitize(e.target.value)})}/>
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                  <span className="text-danger">*</span>
                </label>
                <input type="password" className="form-control"value={data.password} onChange={(e) => setData({...data, password: DOMPurify.sanitize(e.target.value)})}/>
              </div>
              <div className="mb-3">
                <label htmlFor="re-password" className="form-label">
                  Confirm Password
                  <span className="text-danger">*</span>  
                </label>
                <input type="password" className="form-control" value={data.rePass} onChange={(e) => setData({...data, rePass: DOMPurify.sanitize(e.target.value)})}/>
              </div>
              <div className="form-text text-danger">{error}</div>
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    };
  }
  return {
    props: {}
  };
};