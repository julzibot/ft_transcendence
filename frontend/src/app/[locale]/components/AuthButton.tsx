'use client';

import { signIn, signOut, useSession} from "next-auth/react"
import Link from "next/link";
import { useEffect } from "react";

export default function AuthButton() {
  const { data: session} = useSession();

  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js")
  }, []);

  if(session && session.user) {
    return (
      <>
        <div className="dropdown">
          <button className="btn btn-primary dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">{session.user.name}</button>
          <ul className="dropdown-menu">
            <li><Link className="dropdown-item" href="/en/account">Account</Link></li>
            <li><Link className="dropdown-item text-primary" href="/api/auth/signout">Sign Out</Link></li>
          </ul>
        </div>
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