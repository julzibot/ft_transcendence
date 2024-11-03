"use client";

import ThreeScene from "@/components/game/Game";
import { useState, useEffect, useRef } from "react";
import EndGameCard from "@/components/cards/EndGameCard";
import { useAuth } from "@/app/lib/AuthContext";
import { GameInfos, FinalSettings } from "@/types/Game";
import { BACKEND_URL } from "@/config";
import Cookies from "js-cookie";
import { Spinner } from 'react-bootstrap';

export default function Play() {
	const { session } = useAuth();
	const [gameEnded, setGameEnded] = useState<boolean>(false);
	const [gameInfos, setGameInfos] = useState<GameInfos>()
	const [gameMode, setGameMode] = useState<number | null>(null);
	const [finalSettings, setFinalSettings] = useState<FinalSettings>({
		background: 0,
		palette: 0,
		bgColor: '',
		opacity: 0,
		sparks: false,
		game_difficulty: 0,
		points_to_win: 0,
		power_ups: false
	});
	const [loading, setLoading] = useState<boolean>(true);
	const [isClient, setIsClient] = useState<boolean>(false);
	useEffect(() => {
		setIsClient(true);
	}, []);

	async function fetchGameCustoms(id: number | undefined) {
		const response = await fetch(`${BACKEND_URL}/api/gameCustomization/${id}`, {
			method: 'GET',
			credentials: 'include',
		});
		if (response.ok) {
			const data = await response.json();
			setFinalSettings((prev: FinalSettings) => ({
				...prev,
				background: data.background,
				palette: data.palette,
				bgColor: data.bgColor,
				opacity: data.opacity,
				sparks: data.sparks,

			}))
		}
	}

	function retrieveGameSettings() {
		if (typeof window !== 'undefined') {
			const localData = localStorage.getItem('gameSettings');
			if (localData) {
				const settings = JSON.parse(localData);
				setGameMode(settings.gameMode)
				const gameSettings = settings.gameSettings
				setFinalSettings((prev: FinalSettings) => ({
					...prev,
					game_difficulty: gameSettings.game_difficulty,
					points_to_win: gameSettings.points_to_win,
					power_ups: gameSettings.power_ups
				}))
			}
		}
	}

	const createLocalGame = async (mode: number | null) => {
		const response = await fetch(BACKEND_URL + '/api/game/create', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': Cookies.get('csrftoken') as string
			},
			body: JSON.stringify({
				'player1': session?.user?.id,
				'game_mode': mode
			})
		});
		if (response.status === 201) {
			const res = await response.json();
			setGameInfos({
				game_id: parseInt(res.game_id),
				p1Name: session?.user?.username,
				p2Name: gameMode === 0 ? 'guest' : 'ai',
				p1p: session?.user?.image,
				p2p: gameMode === 0 ? '../../guest.png' : '../../airobot.png',
				game_mode: gameMode
			});
		}
	}

	useEffect(() => {
		if (session) {
			fetchGameCustoms(session?.user?.id)
			retrieveGameSettings()
		}
	}, [session])

	useEffect(() => {
		if (gameMode == 0 || gameMode == 1)
			createLocalGame(gameMode)
	}, [gameMode])

	useEffect(() => {
		setTimeout(() => {
			setLoading(false)
		}, 800)
	}, [])

	const handleGameEnded = () => {
		setGameEnded(true)
	}

	if (loading || !gameInfos || gameMode === null) {
		return (
			<div className="d-flex justify-content-center mt-5">
				<div style={{ marginLeft: "-37px", marginTop: "250px" }}>
					<Spinner animation="border" style={{ width: '15rem', height: '15rem', borderWidth: "2px", borderRight: "none", borderLeft: "none", borderTopColor: 'white', borderBottom: "none", animationDuration: "0.7s" }} />
				</div>
			</div>
		);
	}

	return (
		<>
			{isClient && typeof window !== 'undefined' && (
				<ThreeScene
					gameInfos={gameInfos}
					gameSettings={finalSettings}
					room_id={-1}
					user_id={session?.user?.id}
					isHost={true}
					gamemode={gameMode}
					handleGameEnded={handleGameEnded}
				/>)}
			{gameEnded && <EndGameCard gameMode="LOCAL" />}
		</>
	);
}
