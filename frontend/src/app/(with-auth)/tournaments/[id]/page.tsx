"use client";
import { useParams } from 'next/navigation'
import { useAuth } from '@/app/lib/AuthContext';
import TournamentJoinLobby from '@/components/Tournament/TournamentLobby';

import { SocketProvider } from '@/context/socket';

export default function TournamentLobby() {
	const { id } = useParams()
	const { session } = useAuth()

	// make POST

	return (
		<>
			<SocketProvider>
				<TournamentJoinLobby nb_of_participants={5} />
			</SocketProvider>
		</>
	)
}