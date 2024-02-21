'use client';

import { signIn, signOut, useSession} from "next-auth/react"
import Link from "next/link";

export default function AuthButton() {
  const { data: session} = useSession();
  console.log(session?.backendTokens)

  if(session && session.user) {
    return (
      <>
        <h1 className="text-light"> Hello {session?.user.name} </h1>
        <Link href="/en/dashboard">Dashboard</Link>
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