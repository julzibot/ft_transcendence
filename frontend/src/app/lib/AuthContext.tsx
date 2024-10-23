"use client"

import { BACKEND_URL } from '@/config';
import React, { createContext, useEffect, useState, useContext } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface User {
	id: number;
	username: string;
	image: string;
	provider: 'credentials' | '42-school';
}

interface Session {
	user: User | null;
	provider: 'credentials' | '42-school' | null;
}

interface AuthContextType {
	session: Session | null;
	loading: boolean;
	signIn: (username: string, password: string) => Promise<string | undefined>;
	setLoading: (loading: boolean) => void;
	update: () => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ session: null, loading: true, update: () => { }, logout: () => { }, signIn: async () => undefined, setLoading: () => { } });

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
			})
			.finally(() => setLoading(false));
	}

	async function signIn(username: string, password: string) {

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
				provider: 'credentials',
			}),
		})
		if (!response.ok)
			return ('Invalid Username or Password');
		setLoading(false);
		if(typeof window !== 'undefined')
			window.location.reload();
	}

	async function logout() {
		fetch(`${BACKEND_URL}/api/auth/logout/`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'X-CSRFToken': Cookies.get('csrftoken') as string },
		}).then(() => setSession({ user: null, provider: null }))
			.finally(() => router.push('/auth/signin'));
	}

	const checkUserLoggedIn = async () => {
		if (Cookies.get('sessionid')) {
			try {
				const response = await fetch(`${BACKEND_URL}/api/auth/user/`, {
					method: 'GET',
					credentials: 'include'
				});
				const data = await response.json();
				if (response.ok) {
					setSession({ user: data.user, provider: data.user.provider });
				}
				else {
					setSession({ user: null, provider: null });
				}
			}
			catch (error) {
				setSession({ user: null, provider: null });
			} finally {
				setLoading(false);
			}
		}
	}
	useEffect(() => {
		checkUserLoggedIn();
	}, []);

	return (
		<AuthContext.Provider value={{ session, loading, update, logout, signIn, setLoading }}>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => useContext(AuthContext);

