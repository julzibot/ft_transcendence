"use client"

import { API_URL } from '@/config';
import { createContext, useEffect, useState, useContext } from 'react';
import Cookies from 'js-cookie';

interface User {
  id: number;
  username: string;
  image: string;
}

interface Session {
  user: User | null;
}

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  update: () => void;
}

const AuthContext = createContext<AuthContextType>({session: null, loading: true, update: () => {}});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  async function update() {
    fetch(`${API_URL}/auth/user/`, {
      method: 'GET',
      credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
      setSession({user: data.user});
    })
  }

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      if(Cookies.get('sessionid')) {
      try {
        const response = await fetch(`${API_URL}/auth/user/`, {
          method: 'GET',
          credentials: 'include'
        });
        const data = await response.json();
        if (response.ok) {
          setSession({user: data.user});
        }
        else {
          setSession({user: null});
        }
      }
      catch (error) {
        setSession({user: null});
      } finally {
        setLoading(false);
      }
    }
    }

    checkUserLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{session, loading, update}}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext);

