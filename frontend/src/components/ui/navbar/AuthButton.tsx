'use client';

import { signIn,  useSession} from "next-auth/react"
import Link from "next/link";
import { useEffect } from "react";
import Image from "next/image";

export default function AuthButton() {
  const { data: session} = useSession();

  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js")
  }, []);

  if(session && session.user) {
    return (
      <>
        <li className="dropdown me-3">
          <button className="btn btn-light dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <Image className="rounded-circle me-2"
              src={session.user.image}
              width={28}
              height={25}
              alt="42 session picture"
            />
            {session.user.nick_name}
            </button>
          <ul className="dropdown-menu">
						<li><Link className="dropdown-item" href="/en/dashboard">Dashboard</Link></li>
            <li><Link className="dropdown-item" href={`/en/account/profile/${session?.user.id}`}>Profile</Link></li>
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