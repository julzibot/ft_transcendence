'use client'

import { useState } from 'react';
import Join from './Join';
import { SocketContext, socket } from '../../../context/socket';

export default function LocalGame({ userId, gameSettings }) {

	const [gameStarted, setGameStarted] = useState(false);
	const [gameMode, setGameMode] = useState(0);

	// HARD CODED ONLINE GAME TO 2 CHANGE TO 0 !!!
	const startLocalGame = () => {
		setGameMode(2);
		setGameStarted(true);
	}

	const startAI = () => {
		setGameMode(1);
		setGameStarted(true);
	}

	return (
		<>
			<SocketContext.Provider value={socket}>
			{

				gameStarted ? (
					userId && <Join gameMode={gameMode} gameSettings={gameSettings} userId={userId} />
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
			</SocketContext.Provider>
		</>
	)
}