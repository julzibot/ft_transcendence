'use client'

import { useAuth } from "@/app/lib/AuthContext";
import useSocketContext from "@/context/socket";
import { useEffect } from 'react';
import { useParams } from 'next/navigation';

interface TournamentProps {
	nb_of_participants: number
}

export default function TournamentJoinLobby({ nb_of_participants }: TournamentProps) {
	const { session } = useAuth();
	const { id } = useParams()

	const socket = useSocketContext();

	useEffect(() => {



	}, [socket]);

	const handleJoinButton = () => {
		if (socket) {
			socket.emit('join_tournament', { tournament_id: id, nb_of_participants: nb_of_participants, player_id: session?.user?.id });

			socket.on('join_success', (data) => {
				console.log(`Successfully joined Tournament [${data.tournament_id}] with ${data.nb_of_participants} other players`);
			})
		}
	}

	return (
		<>
			<button onClick={() => handleJoinButton}>Join Room</button>
		</>
	)
}