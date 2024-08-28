'use client'

import { useState } from 'react';
import Join from './Join';
import { SocketProvider } from '../../context/socket';
import { GameSettings } from '@/types/GameSettings';

interface OnlineGameProps {
	userId: number,
	gameSettings: GameSettings
}

export default function OnlineGame({ userId, gameSettings }: OnlineGameProps) {

	const [gameStarted, setGameStarted] = useState(false);
	const [gameMode, setGameMode] = useState(0);

	const startOnline = () => {
		setGameMode(2);
		setGameStarted(true);
	}

	const startTournament = () => {
		setGameMode(3);
		setGameStarted(true);
	}

	return (
		<>
			<SocketProvider>
				{
					gameStarted ? (
						userId && <Join gameMode={gameMode} room={''} gameSettings={gameSettings} userId={userId} />
					) : (
						<>
							<div className="d-flex justify-content-center mb-3">
								<button type="button" className="btn btn-success mx-3" onClick={startOnline}>Online Game</button>
							</div>
							<div className="d-flex justify-content-center mb-3">
								<button type="button" className="btn btn-success mx-3" onClick={startTournament}>Tournament</button>
							</div>
						</>
					)
				}
			</SocketProvider>
		</>
	)
}