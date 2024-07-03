'use client';

import { getSession, signIn,  useSession} from "next-auth/react"
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function AuthButton() {
  // const { data: session} = useSession();
  const [session, setSession] = useState() 

  useEffect(() => {
    handleSession()
    require("bootstrap/dist/js/bootstrap.bundle.min.js")
  }, []);
  
  const handleSession = async () => {
    const session = await getSession()
    setSession(session)
  }
  
  if(session && session.user) {
    return (
      <>
        <li className="dropdown me-3">
          <button className="btn btn-light dropdown-toggle d-flex align-items-center" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <div className="position-relative border border-2 border-dark-subtle rounded-circle" style={{width: '30px', height: '30px', overflow: 'hidden'}}>
            {
              session.user.image ? (
                <>
                  <Image
                    src={`http://backend:8000${session.user.image}`}
                    fill
                    alt="profile Pic"
                    />
                </>) : (
                    <div className="position-absolute start-0 top-0 spinner-grow text-secondary" role="status"></div>
            )}
              </div>
              <span className="ms-2">{session.user.nick_name}</span>
            </button>
          <ul className="dropdown-menu">
						<li><Link className="dropdown-item" href="/account/dashboard">Dashboard</Link></li>
            <li><Link className="dropdown-item" href='/account/profile'>Profile</Link></li>
						<li><hr className="dropdown-divider" /></li>
            <li><Link className="dropdown-item text-primary" href="/api/auth/signout">Sign Out</Link></li>
          </ul>
        </li>
      </>
    );
  }
  return (
    <>
      <button className="btn btn-light me-2" onClick={() => signIn()}>
        Sign In
      </button>
    </>
  )
}