"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/lib/AuthContext";
import CSRFToken from "@/components/Utils/CSRFToken";
import FortyTwoSigninButton from "@/components/buttons/FortyTwoSigninButton";


export default function SignIn() {
  const [error, setError] = useState('');
  const { signIn, loading } = useAuth();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = formData.get("username");
    const password = formData.get("password");
    signIn(username as string, password as string).then((message: any) => {
      setError(message);
    });
  }

  return (
    <>
      <div className="d-flex justify-content-center align-items-center p-5 m-5">
        <div className="card shadow-lg text-center rounded-4 border border-light border-1 border-opacity-25 bg-light bg-gradient bg-opacity-75">
          <div className="card-header fs-4 fw-bold">Sign in to your account</div>
          <div className="card-body">
            <FortyTwoSigninButton />
            <hr />
            <p className="fw-3 fw-bold">Or</p>
            <form onSubmit={handleSubmit}>
              <CSRFToken />
              <div className="mb-3">
                <label htmlFor="username" className="form-label fw-bold">
                  Username*
                </label>
                <input
                  required
                  disabled={!loading}
                  type="text"
                  name="username"
                  id="username"
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label fw-bold">
                  Password*
                </label>
                <input
                  required
                  disabled={!loading}
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                />
              </div>
              <button disabled={!loading} type="submit" className="btn btn-dark fw-bold mt-2">
                <span>Sign In</span>
              </button>
              {error !== '' && <p className="mt-2 text-danger">{error}</p>}
            </form>
          </div>
          <div className="card-footer">
            <span>Not Registered Yet? </span>
            <Link href="/auth/register">
              <button disabled={!loading} className="ms-2 btn btn-primary btn-sm">Register</button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
