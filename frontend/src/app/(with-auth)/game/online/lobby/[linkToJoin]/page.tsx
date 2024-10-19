"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation"
import { useAuth } from "@/app/lib/AuthContext";
import { SocketProvider } from "@/context/socket";
import Join from "@/components/game/Join";

export default function Lobby() {
	const { session } = useAuth();
	const { linkToJoin } = useParams();

	const [gameSettings, setGameSettings] = useState(() => {
		const settings = localStorage.getItem("gameSettings");
		const obj = JSON.parse(settings ?? "{}");
		localStorage.removeItem('gameSettings');
		return obj || {};
	});


	return (
		<>
			{
				session && Object.keys(gameSettings).length !== 0 ? (
					<SocketProvider>
						{session?.user?.id && (
							<Join userId={session.user.id} room={linkToJoin.toString()} gameSettings={gameSettings} gameMode={2} />
						)}
					</SocketProvider>
				) : (
					<p>Waiting for Game Settings...</p>
				)
			}

		</>
	)
}