"use client"

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/lib/AuthContext";
import { useEffect } from "react";

export default function AuthButton() {
  const { session, logout } = useAuth();

  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js")
  }, []);

  if (session?.user) {
    return (
      <>
        <div className="dropdown me-3">
          <button className="btn btn-light btn-lg dropdown-toggle d-flex align-items-center me-1" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            {
              session.user.image ? (
                <>
                  <div className=" border border-2 border-dark-subtle rounded-circle" style={{ width: '30px', height: '30px', overflow: 'hidden', position: 'relative' }}>
                    <Image
                      style={{ objectFit: 'cover' }}
                      fetchPriority="high"
                      alt="profile picture"
                      src={`http://django:8000${session.user.image}`}
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
            <li><Link className="dropdown-item" href={`/account/${session?.user?.id}`}>Account</Link></li>
            <li><hr className="dropdown-divider" /></li>
            <li><button className="dropdown-item btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">Sign Out</button></li>
          </ul>
        </div>


        <div className="modal fade" id="exampleModal" tabIndex={2} aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="exampleModalLabel">Signing out</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <span className="card-subtitle">Are you sure you want to sign out?</span>
              </div>
              <div className="modal-footer">
                <div className="d-flex justify-content-between">
                  <div className="flex-row">
                    <button className="flex-column btn btn-outline-secondary me-md-2" data-bs-dismiss="modal" aria-label="Close">Cancel</button>
                    <button data-bs-dismiss="modal" onClick={() => logout()} className=" flex-column btn btn-outline-danger">Sign out</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}