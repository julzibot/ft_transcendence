"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation"
import { useAuth } from "@/app/lib/AuthContext";
import { SocketProvider } from "@/context/socket";
import Join from "@/components/game/Join";
import { BACKEND_URL } from "@/config";
import { User } from "@/types/Auth";

interface User {
	id: number;
	username: string;
	image: string;
}

interface Lobby {
	id: number;
	name: string;
	linkToJoin: string;
	player1: User;
	player2: User | null;
}

export default function Lobby() {
	const { session } = useAuth();
	const { linkToJoin } = useParams();
	const [lobbyData, setLobbyData] = useState<Lobby>(null);

	useEffect(() => {
		const getLobbyData = async () => {
			try {
				const response = await fetch(`${BACKEND_URL}/api/lobby/${linkToJoin}/`, {
					method: "GET",
					credentials: 'include'
				});
				if (!response.ok) {
					throw new Error(`[${response.status}] ` + 'Network response was not ok');
				}
				const data = await response.json()
				setLobbyData(data);

			} catch (error) {
				console.error('Error fetching tournament data:', error)
				throw error
			}
		}
		getLobbyData()
	}, [])


	// const [gameSettings, setGameSettings] = useState(() => {
	// 	const settings = localStorage.getItem("gameSettings");
	// 	const obj = JSON.parse(settings ?? "{}");
	// 	localStorage.removeItem('gameSettings');
	// 	return obj || {};
	// });


	return (
		<>
			{lobbyData && (
				<div className="text-light">
					<h1>{lobbyData.name}</h1>
					<p>{lobbyData.linkToJoin}</p>
					<p>{lobbyData.player1.username}</p>
					{
						lobbyData.player2 && (
							<p>{lobbyData.player2.username}</p>
						)
					}
				</div>)}
			{/* {
				session && Object.keys(gameSettings).length !== 0 ? (
					<SocketProvider>
						{session?.user?.id && (
							<Join userId={session.user.id} room={linkToJoin.toString()} gameSettings={gameSettings} gameMode={2} />
						)}
					</SocketProvider>
				) : (
					<p>Waiting for Game Settings...</p>
				)
			} */}

		</>
	)
}