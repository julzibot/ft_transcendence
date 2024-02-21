"use client";

import Image from "next/image"
import { signIn, signOut, useSession} from "next-auth/react"

function AuthButton() {
  const { data:session} = useSession();

  if(session) {
    return (
      <>
        <h1 className="text-light"> Hello {session?.user?.name } </h1>
        <button className="btn btn-primary" onClick={() => signOut()}>
          Sign Out
        </button>
      </>
    );
  }
  return (
    <>
      <button className="btn btn-primary" onClick={() => signIn()}>
        Sign In
      </button>
    </>
  )
}

export default function AppNav() {

  return(
    <>
      <nav className="navbar navbar-dark bg-dark">
        <AuthButton />
      </nav>
    </>)
}