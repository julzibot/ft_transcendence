import Link from "next/link"
import { register } from '@/app/actions/auth'
import { useFormState, useFormStatus } from 'react'

export default function RegisterForm() {
  const [state, action] = useFormState(register, undefined)

  return (
    <>
      <div className="d-flex justify-content-center align-items-center p-5 m-5">
        <div className="card shadow-lg text-center rounded-4 border border-light border-1 border-opacity-25 bg-light bg-gradient bg-opacity-75">
          <div className="card-header fs-2 fw-bold">Register a new account</div>
          <div className="card-body">
            <form action={register}>
              <div className="mb-1 form-group">
                <label htmlFor="username" className="form-label" >
                  <strong>Username*</strong>
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  className="form-control"
                />
                {state?.errors?.username && <p>{state.errors.username}</p>}
                <p className="form-text">A unique username that will be displayed to other players</p>
              </div>
              <div className="mb-3 form-group">
                <label htmlFor="email" className="form-label" >
                  <strong>Email*</strong>
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="form-control"
                />
                {state?.errors?.email && <p>{state.errors.email}</p>}
              </div>
              <div className="mb-3 form-group">
                <label htmlFor="password" className="form-label">
                  <strong>Password*</strong>
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="form-control"
                />
                {state?.errors?.password && <p>{state.errors.password}</p>}
              </div>
              <div className="mb-3 form-group">
                <label htmlFor="re-password" className="form-label">
                  <strong>Confirm Password*</strong>
                </label>
                <input
                  type="password"
                  name="rePass"
                  id="rePass"
                  className="form-control"
                />
                {state?.errors?.rePass && <p>{state.errors.rePass}</p>}
              </div>
              <SubmitButton />
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

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button disabled={pending} type="submit" className="btn btn-dark fw-bold mt-2">Register</button>
  )
}
