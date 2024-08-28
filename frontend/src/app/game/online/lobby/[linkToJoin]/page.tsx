"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react";
import { SocketProvider } from "@/context/socket";
import Join from "@/components/game/Join";
import { fetchGameSettings } from "@/components/game/Customization";
import { GameSettings } from "@/types/GameSettings";

export default function Lobby() {
	const { data: session, status } = useSession();
	const { linkToJoin } = useParams();
	const searchParams = useSearchParams();
	const settings = searchParams.get('settings');

	if (status === 'loading') {
		return (
			<>
				<p>[session] Loading...</p>
			</>
		);
	}

	if (!session || !session.user.id) {
		return (
			<p>[session] No user session found.</p>
		)
	}

	const [gameSettings, setGameSettings] = useState<GameSettings>({
		user_id: session?.user.id,
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

		setGameSettings(settings ? JSON.parse(settings) : {});
		// if (!settings) {
		// 	fetchGameSettings(session?.user?.id, setGameSettings, gameSettings);
		// 	console.log(gameSettings);
		// }
	}, [settings]);

	return (
		<>
			{
				session && gameSettings ? (
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