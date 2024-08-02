'use client';

import io from "socket.io-client"
import { createContext, useContext, useEffect } from "react"

const socket = io("http://localhost:6500");
const SocketContext = createContext(socket);

export function SocketProvider({ children }) {
	

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