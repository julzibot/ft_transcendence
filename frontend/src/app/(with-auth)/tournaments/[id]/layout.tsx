import { SocketProvider } from "@/context/socket";
import React from 'react'

export default function TournamentLobbyLayout({ children }: { children: React.ReactNode }) {
	return (
		<SocketProvider nsp="tournament">
			{children}
		</SocketProvider>
	)
}