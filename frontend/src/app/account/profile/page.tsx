"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState, FormEvent } from "react";
import ImageUpload from "@/components/Utils/ImageUpload";
import DOMPurify from 'dompurify'
import { useRouter } from "next/navigation";
import background from "/public/static/images/background-profile.jpg"

export default function ProfilePage() {
  const { data: session, update} = useSession({required: true});
  const [isEditing, setIsEditing] = useState(false)
  const [isEditPw, setIsEditPw] = useState(false)
  const [data, setData] = useState({
    username: '',
    oldPassword: '',
    newPassword: '',
    rePassword: '',
    error: '',
    pwDelete: ''
  })
  const router = useRouter()

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const response = await fetch('http://localhost:8000/api/update/password/', {
      method: 'PUT',
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify({
        'user_id': session.user.id,
        'old_password': data.oldPassword,
        'new_password': data.newPassword,
        'rePass': data.rePassword
      })
    })
    const message = await response.json()
    if(!response.ok)
      setData({...data, error: message.message})
    else {
      alert("Password Changed Successfully")
    }
  }

  async function updateUsername(event: FormEvent<HTMLFormElement>){
    event.preventDefault();

    const response = await fetch('http://localhost:8000/api/update/name/', {
      method: 'PUT',
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify({
        'email': session?.user.email,
        'name': data.username
      })
    })
    update({name: data.username})
    setIsEditing(false);
  }

  async function deleteAccount() {
    const response = await fetch('http://localhost:8000/api/auth/user/delete/', {
      method: 'DELETE',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        'user_id': session.user.id,
        'password': data.pwDelete
      })
    })
    if(response.status === 204) {
      // TODO: router does not push
      router.push('/')
    }
    else {
      const res = await response.json()
      setData({...data, error: res.message})
    }
  }

  return(
    <>
    <Image
    className="z-n1"
      src={background}
      quality={100}
      fill
      sizes="100vw"
      style={{
        objectFit: 'cover',
      }}
    />
      <div className="d-flex justify-content-center align-items-center mt-5">
        <div className="card shadow-lg text-center bg-light bg-opacity-75">
          <div className="card-body">
            <div className="position-relative border border-4 border-dark-subtle rounded-circle" style={{width: '280px', height: '280px', overflow: 'hidden'}}>
              {
                session.user.image ? (
                  <>
                    <Image
                      objectFit="cover"
                      fill
                      src={`http://backend:8000${session.user.image}`}
                      alt="Profile Picture"
                      />
                    </>
                  ) : (
                    <div className="spinner-grow"></div>
                  )
                }
            </div>
            <ImageUpload />
            <br />
            <div className="d-flex flex-row justify-content-center align-items-center">
              {
                isEditing ? (
                  <>
                    <form onSubmit={updateUsername}>
                      <input type="text" className="form-control form-control-sm" value={data.username} onChange={(e) => setData({...data, username: DOMPurify.sanitize(e.target.value)})} />
                        <button type="submit" className="btn btn-primary btn-sm rounded-pill">Submit</button>
                        <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary rounded-pill btn-sm">Cancel</button>
                  </form>
                  </>
                ) : (
                  <>
                    <h5 className="card-title me-2">{session.user.nick_name}</h5>
                    <button className="btn btn-sm btn-primary rounded-pill" onClick={() => setIsEditing(true)}>Edit</button>
                  </>
                )
              }
            </div>
            <hr />
            <span className="card-subtitle text-body-secondary fw-semibold">{session.user.email}</span>
            <hr />
            <div className="d-flex flex-row justify-content-center align-items-center">
              {
                isEditPw ? (
                  <>
                    <form onSubmit={changePassword}>
                      <input placeholder="Current Password" className="form-control form-control-sm" type="password" value={data.oldPassword} onChange={(e) => setData({...data, oldPassword: DOMPurify.sanitize(e.target.value)})} />
                      <input placeholder="New Password" className="form-control form-control-sm" type="password" value={data.newPassword} onChange={(e) => setData({...data, newPassword: DOMPurify.sanitize(e.target.value)})} />
                      <input placeholder="Confirm Password" className="form-control form-control-sm" type="password" value={data.rePassword} onChange={(e) => setData({...data, rePassword: DOMPurify.sanitize(e.target.value)})} />
                      <button type="submit" className="btn btn-primary btn-sm rounded-pill">Submit</button>
                      <button type="button" onClick={() => setIsEditPw(false)} className="btn btn-secondary rounded-pill btn-sm">Cancel</button>
                      <div className="form-text text-danger">{data.error}</div>
                    </form>   
                  </>
                ) : (
                  <button className="btn btn-primary btn-sm rounded-pill" onClick={() => setIsEditPw(true) }>Change Password</button>
                )
              }
            </div>
            <hr />
            <button type="button" className="btn btn-danger rounded-pill" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
              Delete Account
            </button>
          </div>
        </div>
      </div>
      <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">We are sad to see you leaving 😔</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form onSubmit={deleteAccount}>
                <label htmlFor="confirm-password-input" className="form-label">Please confirm your password to proceed</label>
                <input 
                  className="form-control" 
                  id="confirm-password-input" 
                  placeholder="Password" 
                  type="password" 
                  value={data.pwDelete} 
                  onChange={(e) => setData({...data, pwDelete: DOMPurify.sanitize(e.target.value)})}
                />
                <div className="form-text text-danger">{data.error}</div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">I Changed My Mind</button>
              <button type="submit" onClick={deleteAccount}className="btn btn-danger">See You</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
};


      