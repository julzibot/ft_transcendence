'use client';

import io from "socket.io-client"
import { createContext, useContext, useEffect } from "react"

const socket = io("http://c2r4p5.42nice.fr:6500");
const SocketContext = createContext(socket);

export function SocketProvider({ children }: { children: React.ReactNode }) {
	

	useEffect(() => {

		socket.on('connect', () => {});

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