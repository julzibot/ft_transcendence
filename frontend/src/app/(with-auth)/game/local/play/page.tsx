"use client";

import ThreeScene from "@/components/game/Game";
import { useState, useEffect } from "react";
import EndGameCard from "@/components/cards/EndGameCard";
import { useAuth } from "@/app/lib/AuthContext";
import { GameSettingsType, GameInfos, GameCustoms } from "@/types/Game";
import { BACKEND_URL } from "@/config";
import Cookies from "js-cookie";
import { set } from "zod";


export default function Play() {
	const { session } = useAuth();
	const [start, setStart] = useState<boolean>(false);
	const [gameEnded, setGameEnded] = useState<boolean>(false);
	const [gameCustoms, setGameCustoms] = useState<GameCustoms | undefined>();
	const [gameSettings, setGameSettings] = useState<GameSettingsType | undefined>();
	const [gameInfos, setGameInfos] = useState<GameInfos>()
	const [gameMode, setGameMode] = useState<number>(0);
	const [finalSettings, setFinalSettings] = useState({
		background: '',
		palette: '',
		bgColor: '',
		opacity: 0,
		sparks: 0,
		game_difficulty: 0,
		points_to_win: 0,
		power_ups: 0
	});


	useEffect(() => {
		async function fetchGameCustoms(id: number | undefined) {
			const response = await fetch(`${BACKEND_URL}/api/gameCustomization/${id}`, {
				method: 'GET',
				credentials: 'include',
			});
			if (response.ok) {
				const data = await response.json();
				setGameCustoms(data);
			}
		}

		function retrieveGameSettings() {
			if(typeof window !== 'undefined') {
				const localData = localStorage.getItem('gameSettings');
				if(localData) {
					const settings = JSON.parse(localData);
					setGameMode(JSON.parse(settings.gameMode))
					setGameSettings(settings.gameSettings);
			}
		}
		}

		const createLocalGame = async () => {
			const response = await fetch(BACKEND_URL + '/api/game/create', {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': Cookies.get('csrftoken') as string
				},
				body: JSON.stringify({
					'player1': session?.user?.id,
					'game_mode': gameMode
				})
			});
			if (response.status === 201) {
				const res = await response.json();
				setGameInfos({
					game_id: parseInt(res.id),
					p1Name: session?.user?.username,
					p2Name: gameMode === 0 ? 'guest' : 'ai',
					p1p: session?.user?.image,
					p2p: gameMode === 0 ? '../../guest.png' : '../../airobot.png'
				});
			}
		}
		
		if (session) {
			fetchGameCustoms(session?.user?.id);
			retrieveGameSettings();
			createLocalGame();
			setFinalSettings({
				background: gameCustoms?.background,
				palette: gameCustoms?.palette,
				bgColor: gameCustoms?.bgColor,
				opacity: gameCustoms?.opacity,
				sparks: gameCustoms?.sparks,
				game_difficulty: gameSettings?.game_difficulty,
				points_to_win: gameSettings?.points_to_win,
				power_ups: gameSettings?.power_ups
			});
		}
		return () => {
			if( typeof window !== 'undefined') {
				localStorage.removeItem('gameSettings');
			}
		}
	}, [session]);

	useEffect(() => {
		setStart(true)
	}, [finalSettings])

	return (
		<>
			{start && (
				<>
					<ThreeScene
						gameInfos={gameInfos}
						gameSettings={finalSettings}
						room_id={-1}
						user_id={session?.user?.id}
						isHost={true}
						gamemode={gameMode}
						handleGameEnded={setGameEnded}
					/>
					{gameEnded && <EndGameCard />}
				</>
			)}
		</>
	);
}
