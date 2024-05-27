"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState, FormEvent } from "react";
import ImageUpload from "@/components/Utils/ImageUpload";

type Props = {
  params: {
    id: string;
  };
};

function ProfilePage(props: Props){
  const { data: session, update} = useSession();
  const [isEditing, setIsEditing] = useState(false)
  const [data, setData] = useState({
    username: '',
    oldPassword: '',
    newPassword: '',
    rePassword: '',
    error: ''
  })

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const response = await fetch('http://localhost:8000/api/update/password/', {
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

  if(session) {
    return (
      <>
        <h1>Profile</h1>
        <h2>{session.user.nick_name}</h2>
        {isEditing ? (
          <form onSubmit={updateUsername}>
            <input type="text" value={data.username} onChange={(e) => setData({...data, username: e.target.value})} />
            <button type="submit" className="btn btn-primary">Submit</button>
            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-primary">Cancel</button>
          </form>
        ) : (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit Username</button>
        )}
        <p>{session.user.email}</p>
        <form onSubmit={changePassword}>
          <input placeholder="Current Password" type="password" value={data.oldPassword} onChange={(e) => setData({...data, oldPassword: e.target.value})} />
          <input placeholder="New Password" type="password" value={data.newPassword} onChange={(e) => setData({...data, newPassword: e.target.value})} />
          <input placeholder="Confirm Password" type="password" value={data.rePassword} onChange={(e) => setData({...data, rePassword: e.target.value})} />
          <button type="submit" className="btn btn-primary">Submit</button>
          <div className="form-text text-danger">{data.error}</div>
        </form>
        <Image 
          src={`http://backend:8000${session.user.image}`}
          width={120}
          height={80}
          alt="session picture"/>
        <ImageUpload />
      </>
    );
  }
  else {
    return(<h1>Error</h1>)
  }
};

export default ProfilePage;