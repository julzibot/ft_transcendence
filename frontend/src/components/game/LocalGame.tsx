'use client'

import { useState, useEffect } from 'react';
import ThreeScene from './Game';
import { GameSettings } from '@/types/GameSettings';

interface LocalGameProps {
	userId: number,
	gameSettings: GameSettings
}

export default function LocalGame({ userId, gameSettings }: LocalGameProps) {

	const [gameStarted, setGameStarted] = useState(false);
	const [gameMode, setGameMode] = useState(0);
	// const [fetchedInfos, setFetchedInfos] = useState(false);

	// useEffect(() => {
	// 	// GET infos
	// 	if (response.ok)
	// 		setFetchedInfos(true);
	// }, []);

	const startLocal = () => {
		setGameMode(0);
		setGameStarted(true);
	}

	const startAI = () => {
		setGameMode(1);
		setGameStarted(true);
	}

	return (
		<>
			{

				gameStarted ? (
					userId && <ThreeScene gameSettings={gameSettings} room_id={-1} user_id={userId} isHost={true} gamemode={gameMode} />
				) : (
					<>
						<div className="d-flex justify-content-center mb-3">
							<button type="button" className="btn btn-secondary mx-3" onClick={startAI}>Play Against AI</button>
						</div>
						<div className="d-flex justify-content-center mb-3">
							<button type="button" className="btn btn-secondary mx-3" onClick={startLocal}>Local Multiplayer</button>
						</div>
					</>
				)
			}
		</>
	)
}