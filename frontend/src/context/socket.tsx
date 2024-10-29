'use client'

import io, { Socket } from "socket.io-client"
import { createContext, useContext, useEffect, useState } from "react";
import { DOMAIN_NAME, SOCKET_PORT } from "@/config";

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children, nsp }: { children: React.ReactNode, nsp: string }) {
	const [socket, setSocket] = useState<Socket | null>(null);

	useEffect(() => {
		const newSocket = io(`https://${DOMAIN_NAME}:${SOCKET_PORT}${nsp}`, {
			transports: ['websocket'],
			secure: true
		});

		setSocket(newSocket);
		newSocket.on('connect', () => {
			console.log(`[SocketProvider] Entering namespace: ${nsp}`);
		});

		return (() => {
			console.log(`[SocketProvider] Leaving namespace: ${nsp}`);
			newSocket.disconnect();
		})

	}, []);

	return (
		<SocketContext.Provider value={socket}>
			{children}
		</SocketContext.Provider>
	)
}

export default function useSocketContext() { return useContext(SocketContext) };