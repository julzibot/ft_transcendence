'use client'

import io, { Socket } from "socket.io-client"
import { createContext, useContext, useEffect, useState } from "react";
import { DOMAIN_NAME, SOCKET_PORT } from "@/config";

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
	const [socket, setSocket] = useState<Socket | null>(null);

	useEffect(() => {
		const newSocket = io(`http://${DOMAIN_NAME}:${SOCKET_PORT}`);

		setSocket(newSocket)
		newSocket.on('connect', () => { });

		return (() => {
			newSocket.disconnect()
		})

	}, []);

	return (
		<SocketContext.Provider value={socket}>
			{children}
		</SocketContext.Provider>
	)
}

export default function useSocketContext() { return useContext(SocketContext) };