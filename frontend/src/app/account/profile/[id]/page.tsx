"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState, FormEvent } from "react";
import ImageUpload from "@/components/Utils/ImageUpload";
import DOMPurify from 'dompurify'
import { useRouter } from "next/navigation";
import { BASE_URL } from "@/utils/constants";

type Props = {
  params: {
    id: string;
  };
};

function ProfilePage(props: Props){
  const { data: session, update} = useSession({
    required: true
  });
  const [isEditing, setIsEditing] = useState(false)
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

    const response = await fetch(BASE_URL + 'update/password/', {
      method: 'PUT',
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify({
        'user_id': props.params.id,
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

    const response = await fetch(BASE_URL + 'update/name/', {
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
    const response = await fetch(BASE_URL + 'auth/user/delete/', {
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
} 

  if(session) {
    return (
      <>
        <h1>Profile</h1>
        <h2>{session.user.nick_name}</h2>
        {isEditing ? (
          <form onSubmit={updateUsername}>
            <input type="text" value={data.username} onChange={(e) => setData({...data, username: DOMPurify.sanitize(e.target.value)})} />
            <button type="submit" className="btn btn-primary">Submit</button>
            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-primary">Cancel</button>
          </form>
        ) : (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit Username</button>
        )}
        <p>{session.user.email}</p>
        <form onSubmit={changePassword}>
          <input placeholder="Current Password" type="password" value={data.oldPassword} onChange={(e) => setData({...data, oldPassword: DOMPurify.sanitize(e.target.value)})} />
          <input placeholder="New Password" type="password" value={data.newPassword} onChange={(e) => setData({...data, newPassword: DOMPurify.sanitize(e.target.value)})} />
          <input placeholder="Confirm Password" type="password" value={data.rePassword} onChange={(e) => setData({...data, rePassword: DOMPurify.sanitize(e.target.value)})} />
          <button type="submit" className="btn btn-primary">Submit</button>
          <div className="form-text text-danger">{data.error}</div>
        </form>
        {
              session.user.image ? (
                <>
                  <Image className="me-2"
                    src={`http://backend:8000${session.user.image}`}
                    width={100}
                    height={60}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    alt="42 session picture"
                  />
                </>) : (    
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="sr-only"></span>
                  </div>
            )}
        <ImageUpload />
          

        <button type="button" className="btn btn-danger" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
          Delete Account
        </button>
        
        <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="staticBackdropLabel">We are sad to see you leaving 😔</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <form onSubmit={deleteAccount}>
                  <label htmlFor="" className="form-label">Please confirm your password to proceed</label>
                  <input placeholder="Password" type="password" value={data.pwDelete} onChange={(e) => setData({...data, pwDelete: DOMPurify.sanitize(e.target.value)})}/>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">I Changed My Mind</button>
                <button type="submit" className="btn btn-danger">See You</button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  else {
    return(<h1>Error</h1>)
  }
};

ProfilePage.auth = true

export default ProfilePage;