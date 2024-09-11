"use client";

import "react"
import { useState, FormEvent } from "react";
import Link from "next/link"
import DOMPurify from 'dompurify'
import "react";
import { useAuth } from "@/app/context/AuthContext";
import { ChangeEvent } from "react";

export default function Register() {
  const [data, setData] = useState({
    username: '',
    email: '',
    password: '',
    rePass: ''
  });
  const [error, setError] = useState<string | null>(null)
  const { register, loading } = useAuth();

  async function registerUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const response = await register(data);
    if (response)
      setError(response)
  }

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: DOMPurify.sanitize(e.target.value) });
    
  };

  return (
    <>
      <div className="d-flex justify-content-center align-items-center p-5 m-5">
        <div className="card shadow-lg text-center rounded-4 border border-light border-1 border-opacity-25 bg-light bg-gradient bg-opacity-75">
          <div className="card-header fs-2 fw-bold">Register a new account</div>
          <div className="card-body">
            <form onSubmit={registerUser}>
              <div className="mb-1 form-group">
                <label htmlFor="username" className="form-label" >
                    <strong>Username*</strong>
                </label>
                <input 
                  type="text" 
                  name="username" 
                  className="form-control" 
                  value={data.username} 
                  onChange={onChange} 
                />
                <p className="form-text">A unique username that will be displayed to other players</p>
              </div>
              <div className="mb-3 form-group">
                <label htmlFor="email" className="form-label" >
                  <strong>Email*</strong>
                </label>
                <input 
                  type="email" 
                  name="email" 
                  className="form-control" 
                  value={data.email} 
                  onChange={onChange} />
              </div>
              <div className="mb-3 form-group">
                <label htmlFor="password" className="form-label">
                  <strong>Password*</strong>
                </label>
                <input 
                  type="password" 
                  name="password"
                  className="form-control" 
                  value={data.password} 
                  onChange={onChange} />
              </div>
              <div className="mb-3 form-group">
                <label htmlFor="re-password" className="form-label">
                  <strong>Confirm Password*</strong>
                </label>
                <input 
                  type="password"
                  name="rePass"
                  className="form-control" 
                  value={data.rePass} 
                  onChange={onChange} />
              </div>
              <p className="text-danger">{error}</p>
              {
                loading ? (
                <button className="btn-dark btn fw-bold mt-2">
                  <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </button>
              ): <button type="submit" className="btn btn-dark fw-bold mt-2">Submit</button>
              }
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
