"use client"

import { BACKEND_URL } from '@/config';
import React, { createContext, useEffect, useState, useContext } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  username: string;
  image: string;
}

interface Session {
  user: User | null;
  provider: 'credentials' | '42-school' | null;
}

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  signIn: (provider: 'credentials' | '42-school', username: string, password: string) => string[] | undefined;
  update: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({session: null, loading: true, update: () => {}, logout: () => {}, signIn: () => undefined});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  async function update() {
    fetch(`${BACKEND_URL}/api/auth/user/`, {
      method: 'GET',
      credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
      setSession((prevSession) => ({
        ...prevSession, 
        user: data.user,
        provider: prevSession?.provider || null
      }));
    });
  }

  async function signIn(provider: 'credentials' | '42-school', username: string, password: string) {
    switch (provider) {
      case 'credentials':
          const response = await fetch(`${BACKEND_URL}/api/auth/signin/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-CSRFToken': Cookies.get('csrftoken') as string,
            },
            body: JSON.stringify({
              username,
              password,
            }),
          })
          const data = await response.json();
          setLoading(false);
          if(response.ok)
          {
            setSession({user: data.user, provider: 'credentials'});
            window.location.reload();
          }
          else {
            return ('Invalid Username or Password');
          }
        break;
      case '42-school':
        break;
      }
  }

  async function logout() {
    fetch(`${BACKEND_URL}/api/auth/logout/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-CSRFToken':  Cookies.get('csrftoken') as string },
    }).then(() => setSession({user: null, provider: null}))
      .finally(() => router.push('/auth/signin'));
  }

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      if(Cookies.get('sessionid')) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/user/`, {
          method: 'GET',
          credentials: 'include'
        });
        const data = await response.json();
        if (response.ok) {
          setSession((prevSession) => ({user: data.user, provider: prevSession?.provider || null}));
        }
        else {
          setSession({user: null, provider: null});
        }
      }
      catch (error) {
        setSession({user: null, provider: null});
      } finally {
        setLoading(false);
      }
    }
  }
    checkUserLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{session, loading, update, logout, signIn}}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext);

