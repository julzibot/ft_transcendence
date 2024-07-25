"use client";

import { useEffect } from 'react';
import { useSession, signOut} from 'next-auth/react'

export default function BeforeUnload() {
  const {data: session, status} = useSession()

  
  useEffect(() => {
    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      event.preventDefault();
      if(status === 'authenticated') {
        await fetch('http://localhost:8000/api/auth/signout/', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          'id': session?.user.id
        })
    })
    }
    signOut({redirect: false})
    event.returnValue = ''
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return null;
};
