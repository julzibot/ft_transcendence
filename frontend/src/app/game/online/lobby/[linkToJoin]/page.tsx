"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react";
import { SocketProvider } from "@/context/socket";
import Join from "@/components/game/Join";
import { GameSettings } from "@/types/GameSettings";

export default function Lobby() {
	const { data: session } = useSession();
	const { linkToJoin } = useParams();
	const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);
	const [start, setStart] = useState(false);

	if (!session || !session.user.id) {
		return (
			<p>[session] No user session found.</p>
		)
	}

	useEffect(() => {
		const settings = localStorage.getItem("gameSettings");
		if (settings) {
			const obj = JSON.parse(settings);
			setGameSettings(obj);
			localStorage.removeItem('gameSettings');
			setStart(true);
		} else {
			console.log('[Lobby] No Game Settings');
		}
	}, []);

	return (
		<>
			{
				session && gameSettings && start ? (
					<SocketProvider>
						<Join userId={session?.user.id} room={linkToJoin.toString()} gameSettings={gameSettings} gameMode={2} />
					</SocketProvider>
				) : (
					<p>Waiting for Game Settings...</p>
				)
			}

		</>
	)
}