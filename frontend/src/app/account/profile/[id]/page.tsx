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
  const [username, setUsername] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>){
    event.preventDefault();

    const response = await fetch('http://localhost:8000/api/update/name/', {
      method: 'PUT',
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify({
        'email': session?.user.email,
        'name': username
      })
    })
    update({name: username})
    setIsEditing(false);
  }

  if(session) {
    return (
      <>
        <h1>Profile</h1>
        <h2>{session.user.nick_name}</h2>
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            <button type="submit" className="btn btn-primary">Submit</button>
            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-primary">Cancel</button>
          </form>
        ) : (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit Username</button>
        )}
        <p>{session.user.email}</p>
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