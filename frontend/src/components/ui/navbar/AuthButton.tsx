'use client';

import { signIn, signOut, useSession } from "next-auth/react"
import Link from "next/link";
import { useEffect } from "react";
import Image from "next/image";

export default function AuthButton() {
  const { data: session } = useSession();

  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js")
  }, []);

  async function handleSignOut() {
    const response = await fetch('http://localhost:8000/api/auth/signout/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'id': session?.user.id
      })
    })
    signOut({ callbackUrl: 'http://localhost:3000/auth/signin' })
  }

  if (session && session.user) {
    return (
      <>
        <div className="dropdown me-3">
          <button className="btn btn-light btn-lg dropdown-toggle d-flex align-items-center" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            {
              session.user.image ? (
                <>
                  <div className=" border border-2 border-dark-subtle rounded-circle" style={{ width: '30px', height: '30px', overflow: 'hidden', position: 'relative' }}>
                    <Image
                      style={{ objectFit: 'cover' }}
                      fetchPriority="high"
                      alt="profile picture"
                      src={`http://backend:8000${session.user.image}`}
                      fill
                      sizes="10vw"
                    />
                  </div>
                </>
              ) : (
                <div className="spinner-border text-secondary" role="status"></div>
              )}
            <span className="ms-2">{session.user.username}</span>
          </button>

          <ul className="dropdown-menu">
            <li><Link className="dropdown-item" href='/account'>Account</Link></li>
            <li><hr className="dropdown-divider" /></li>
            <li><button className="dropdown-item btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">Sign Out</button></li>
          </ul>
        </div>
        <div className="modal fade" id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog text-center">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="exampleModalLabel">Signout</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <span className="card-subtitle">Are you sure you want to sign out?</span>
              </div>
              <div className="modal-footer">
                <div className="container justify-content-center">
                  <div className="row">
                    <button className="col btn btn-outline-secondary me-md-2" data-bs-dismiss="modal" aria-label="Close">Cancel</button>
                    <button className=" col btn btn-outline-danger" type="button" onClick={handleSignOut}>Sign out</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  return;
}