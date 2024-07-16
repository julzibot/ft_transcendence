'use client'

import { useState } from 'react';
import Join from './Join';
import { SocketContext } from '../../../context/socket';

export default function LocalGame({ userId }) {

	const [gameStarted, setGameStarted] = useState(false);
	const [gameMode, setGameMode] = useState(0);

	const startLocalGame = () => {
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
					userId && <Join gameMode={gameMode} userId={userId} />
				) : (
				<>
					<div className="d-flex justify-content-center mb-3">
						<button type="button" className="btn btn-secondary mx-3" onClick={startAI}>Play Against AI</button>
					</div>
					<div className="d-flex justify-content-center mb-3">
						<button type="button" className="btn btn-secondary mx-3" onClick={startLocalGame}>Local Multiplayer</button>
					</div>
				</>
				)
			}
		</>
	)
}