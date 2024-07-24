'use client'

import { useEffect, useState, useContext } from "react";
import { SocketContext, socket } from "../../../context/socket";
import ThreeScene from '../game/Game';

export default function Join({ gameMode, gameSettings, userId }) {

	const socket = useContext(SocketContext);
	if (gameMode === 2) {

		const [gameJoined, setGameJoined] = useState(false);
		const [isHost, setIsHost] = useState(false);
		const [player2_id, setPlayer2_id] = useState(null);
		const room_id = 5;

		
		useEffect(() => {
			socket.emit('join_room', { room_id: room_id, user_id: userId });
			console.log('Joining room: ' + room_id + " " + userId)

			socket.on('isHost', () => {
				setIsHost(true);
				console.log("You are player 1");
			});

			socket.on('player2_id', (data) => {
				console.log('setting player2 id');
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
			<p>{userId}</p>
			{gameJoined ? <p>true</p> : <p>false</p>}
				{userId && gameJoined ? 
					<ThreeScene gameSettings={gameSettings} room_id={room_id} user_id={userId} player2_id={player2_id} isHost={isHost} gamemode={2} /> :
					<div>Loading game...</div>}
			</>
		)
	}
	else {
		return (
			<>
				{
					userId && <ThreeScene gameSettings={gameSettings} room_id={-1} user_id={userId} isHost={true} gamemode={gameMode} />
				}
			</>
		)
	}
}