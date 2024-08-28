"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react";
import { SocketProvider } from "@/context/socket";
import Join from "@/components/game/Join";
import { fetchGameSettings } from "@/components/game/Customization";
import { GameSetings } from "@/types/GameSettings";

export default function Lobby() {
	const { data: session } = useSession();
	const { linkToJoin } = useParams();
	const searchParams = useSearchParams();
	const settings = searchParams.get('settings');

	const [gameSettings, setGameSettings] = useState<GameSetings>({
		user_id: session?.user.id ?? -1,
		background: 0,
		palette: 0,
		bgColor: '#ff0000',
		opacity: 80,
		sparks: true,
		gameDifficulty: 4,
		pointsToWin: 5,
		powerUps: true
	});

	useEffect(() => {

		setGameSettings(settings ? JSON.parse(settings) : null);
		if (!settings && session?.user.id) {
			fetchGameSettings(session?.user?.id, setGameSettings, gameSettings);
			console.log(gameSettings);
		}
	}, [settings]);


	return (
		<>
			{
				gameSettings ? (
					<SocketProvider>
						<Join userId={session?.user.id} room={linkToJoin} gameSettings={gameSettings} gameMode={2} />
					</SocketProvider>
				) : (
					<p>Waiting for Game Settings...</p>
				)
			}

		</>
	)
}