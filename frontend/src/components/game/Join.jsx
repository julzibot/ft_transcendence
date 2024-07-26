'use client'

import { useEffect, useState, useContext } from "react";
import { SocketContext, socket } from "../../../context/socket";
import ThreeScene from './Game';

// Join is a component for Online Game
export default function Join({ gameMode, gameSettings, userId }) {

	const socket = useContext(SocketContext);

		const [gameJoined, setGameJoined] = useState(false);
		const [isHost, setIsHost] = useState(false);
		const [player2_id, setPlayer2_id] = useState(null);
		const room_id = 5;

		useEffect(() => {
			socket.emit('join_room', { room_id: room_id, user_id: userId });
			console.log(`[${userId}] Joining room: ${room_id}`)

			socket.on('isHost', () => {
				setIsHost(true);
				console.log("You are player 1");
			});

			socket.on('player2_id', (data) => {
				setPlayer2_id(data.player2_id);
			});

			if (isHost && player2_id) {
				socket.on('startGame', () => {
					setGameJoined(true);
				});
			} else if (!isHost) {
				socket.on('startGame', () => {
					setGameJoined(true);
				});
			}

			return () => {
				socket.off('isHost');
				socket.off('player2_id');
				socket.off('startGame');
			};
		}, [socket]);

		return (
			<>
				{userId && gameJoined ? (
						// gamemode hardcoded to 2 for now - speak to Jules about handling online/tournament modes
						<ThreeScene gameSettings={gameSettings} room_id={room_id} user_id={userId} player2_id={player2_id} isHost={isHost} gamemode={2} />
					) : (
						<div>Loading game...</div>
					)
				}
			</>
		)
}