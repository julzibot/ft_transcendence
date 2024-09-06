'use client'

import { useState, useEffect } from 'react';
import ThreeScene from './Game';
import { GameSettings } from '@/types/GameSettings';
import { BASE_URL } from '../../utils/constants';

interface LocalGameProps {
	userId: number,
	gameSettings: GameSettings
}

export default function LocalGame({ userId, gameSettings }: LocalGameProps) {

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
				const response = await fetch(BASE_URL + 'game/create', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
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

			const getGameInfos = async (game_id) => {
				const response = await fetch(BASE_URL + `game/history/${game_id}`, {
					method: 'GET',
					headers: { 'Content-Type': 'application/json' }
				})
				if (response.ok) {
					const res = await response.json();
					const data = res.data;
					setGameInfos({
						...gameInfos,
						p1Name: data.player1.username,
						p2Name: gameMode === 0 ? 'guest' : 'ai',
						p1p: data.player1.image,
						p2p: gameMode === 0 ? '../../guest.png' : '../../airobot.png'
					});
					setMatchFetched(true);
					setGameStarted(true);
				}
				else
					console.log('[Join] [fetchGameInfos] Error fetching: ' + response.status);
			};
			getGameInfos(gameInfos.game_id);
		}
	}, [gameCreated]);

	const startLocal = () => {
		setGameMode(0);
		setClick(true);
	}

	const startAI = () => {
		setGameMode(1);
		setClick(true);
	}

	return (
		<>
			{
				gameStarted ? (
					<ThreeScene gameInfos={gameInfos} gameSettings={gameSettings} room_id={-1} user_id={userId} isHost={true} gamemode={gameMode} />
				) : (
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
		</>
	)
}