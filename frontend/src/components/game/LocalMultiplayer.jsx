'use client'

import { useState } from 'react';
import Join from './Join';

export default function LocalMultiplayer({ remoteGame, userId }) {

	const [gameStarted, setGameStarted] = useState(false);

	const startGame = () => {
		setGameStarted(true);
	}

	return (
		<>
			{
				gameStarted ? (
						userId && <Join remoteGame={remoteGame} userId={userId} />
				) : (
					<button type="button" className="btn btn-secondary mx-3" onClick={startGame}>
						Local Multiplayer
					</button>
				)
			}
		</>
	)
}