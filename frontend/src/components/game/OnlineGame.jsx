'use client'

import { useState } from 'react';
import Join from './Join';
import { SocketContext, socket } from '../../../context/socket';

export default function OnlineGame({ userId, gameSettings }) {

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
			<SocketContext.Provider value={socket}>
			{
				gameStarted ? (
					userId && <Join gameMode={gameMode} gameSettings={gameSettings} userId={userId} />
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
			</SocketContext.Provider>
		</>
	)
}