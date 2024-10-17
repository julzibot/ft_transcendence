'use client';

import io from "socket.io-client"
import { createContext, useContext, useEffect, React } from "react"
import { DOMAIN_NAME, SOCKET_PORT } from "@/config";

const socket = io(`http://${DOMAIN_NAME}:${SOCKET_PORT}`);
const SocketContext = createContext(socket);

export function SocketProvider({ children }: { children: React.ReactNode }) {


	useEffect(() => {

		socket.on('connect', () => { });

		// return (() => {
		// 	socket.disconnect()
		// })

	}, [socket]);

	return (
		<SocketContext.Provider value={socket}>
			{children}
		</SocketContext.Provider>
	)
}

export function useSocketContext() {
	return useContext(SocketContext);
}