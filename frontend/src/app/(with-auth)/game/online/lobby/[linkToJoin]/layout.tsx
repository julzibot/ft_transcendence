import { SocketProvider } from "@/context/socket";
import React from 'react'

export default function LobbyLayout({ children }: { children: React.ReactNode }) {
	return (
		<SocketProvider>
			{children}
		</SocketProvider>
	)
}