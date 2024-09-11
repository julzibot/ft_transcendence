"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/config';
import { getCookie, setCookie } from 'cookies-next';
import { React } from 'react';
import { Session } from '@/types/Auth';



const AuthContext = createContext({});

export function AuthProvider({ children }: {children: React.ReactNode}) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const cookie = getCookie('access') ?? null;
  const router = useRouter();

  const fetchSession = async() => {
    const response = await fetch(`${API_URL}/auth/user/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cookie}`
      }
    })
    if(response.status === 200) {
      const data = await response.json();
      setSession(data);
      setLoading(false);
    }
  }
  
  useEffect(() => {
    //fetch user if access token exists
    if(cookie)
      fetchSession();
    else
      router.push('/auth/signin');
  }, [])

  async function register(credentials: { username: string, email: string, password: string, rePass: string }) {
    setLoading(true);
    const response = await fetch (`${API_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
    const data = await response.json();
    setLoading(false);
    if(response.status === 201) {
      router.push('/auth/signin');
    }
    else
      return data.error;
  }

  async function signin(provider: 'credentials' | '42', credentials: { username: string, password: string }) {
    if (provider === 'credentials') {
      const response = await fetch(`${API_URL}/token/`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'username': credentials.username,
          'password': credentials.password
        })
      })
      const data = await response.json();
      if(response.status === 200) {
        setCookie('access', data.access, {
          httpOnly: true,
          // secure: process.env.NODE_ENV === 'production',
          // expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
          secure: true,
          sameSite: 'strict',
          path: '/'
        });
        fetchSession();
        setLoading(false);
        router.push('/');
      }
      else
        return { error: data };
    }
  }

  return (
    <AuthContext.Provider value={{ session, loading, register, signin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext)

export default AuthContext;
