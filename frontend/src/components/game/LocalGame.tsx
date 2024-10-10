'use client'

import { useState, useEffect } from 'react';
import ThreeScene from './Game';
import { GameSettings } from '@/types/GameSettings';
import { BACKEND_URL } from '@/config';
import { gameCustomSave } from './Customization';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface LocalGameProps {
	userId: number,
	gameSettings: GameSettings
}

export default function LocalGame({ userId, gameSettings }: LocalGameProps) {

	const router = useRouter();
	const [gameStarted, setGameStarted] = useState(false);
	const [gameMode, setGameMode] = useState(-1);
	const [gameCreated, setGameCreated] = useState(false);
	const [matchFetched, setMatchFetched] = useState(false);
	const [click, setClick] = useState(false);
	const [gameInfos, setGameInfos] = useState({
		game_id: -1,
		p1Name: '',
		p2Name: '',
		p1p: '',
		p2p: ''
	})

	useEffect(() => {
		if (click && !gameCreated) {
			const createLocalGame = async () => {
				const response = await fetch(BACKEND_URL + '/api/game/create', {
					method: 'POST',
					credentials: 'include',
					headers: { 
						'Content-Type': 'application/json',
						'X-CSRFToken': Cookies.get('csrftoken') as string
					},
					body: JSON.stringify({
						'player1': userId,
						'game_mode': gameMode
					})
				});
				if (response.status === 201) {
					const res = await response.json();
					setGameInfos({ ...gameInfos, game_id: parseInt(res.id) });
					setGameCreated(true); // now GET match info
				}
				else
					console.log('[Join] Error: ' + response.status);
			};
			createLocalGame();
		}
	}, [gameMode]);

	useEffect(() => {
		if (gameCreated && !matchFetched) {

			const getGameInfos = async (game_id: number) => {
				const response = await fetch(BACKEND_URL + `/api/game/history/${game_id}`, {
					method: 'GET',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' }
				})
				if (response.ok) {
					const res = await response.json();
					const data = res.data;
					setGameInfos((prevGameInfos) => ({
						...prevGameInfos,
						p1Name: data.player1.username,
						p2Name: gameMode === 0 ? 'guest' : 'ai',
						p1p: data.player1.image,
						p2p: gameMode === 0 ? '../../guest.png' : '../../airobot.png'
					}));
					setMatchFetched(true);
					setGameStarted(true);
				}
				else
					console.log('[Join] [fetchGameInfos] Error fetching: ' + response.status);
			};
			getGameInfos(gameInfos.game_id);
		}
	}, [gameCreated]);

	useEffect(() => {
		if (gameStarted) {
			const localProps = {
				gameInfos: gameInfos,
				gameSettings: gameSettings,
				userId: userId,
				gameMode: gameMode
			}
			localStorage.setItem("localProps", JSON.stringify(localProps));
			console.log('[LocalGame] localProps:' + JSON.stringify(localProps));
			router.push("/game/local/play");
		}
	}, [gameStarted]);

	const startLocal = () => {
		gameCustomSave('parameters/', JSON.stringify(gameSettings));
		setGameMode(0);
		setClick(true);
	}

	const startAI = () => {
		gameCustomSave('parameters/', JSON.stringify(gameSettings));
		setGameMode(1);
		setClick(true);
	}

	return (
		<>
			<div className="d-flex justify-content-center mb-3">
				<button type="button" className="btn btn-secondary mx-3" onClick={() => startAI()}>Play Against AI</button >
			</div >
			<div className="d-flex justify-content-center mb-3">
				<button type="button" className="btn btn-secondary mx-3" onClick={() => startLocal()}>Local Multiplayer</button>
			</div>
		</>
	)
}