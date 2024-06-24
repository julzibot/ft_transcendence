'use client'

import { useEffect, useState, useContext } from "react";
import { SocketContext } from "../../../context/socket";
import ThreeScene from '../game/Game'

export default function Join({ remoteGame }) {

	const [gameSettings, setGameSettings] = useState(() => {
		const fetchedSettings = localStorage.getItem('gameSettings');
		const parsedSettings = JSON.parse(fetchedSettings);
		console.log('fetched settings: ' + fetchedSettings);
		return parsedSettings || "";
	});

	console.log('[Join] Game Settings: ' + JSON.stringify(gameSettings));
	if (remoteGame === true)
	{
		const socket = useContext(SocketContext);

		const [gameJoined, setGameJoined] = useState(false);
		const [isHost, setIsHost] = useState(false);
		const room_id = 5;

		socket.emit('join_room', { room_id: room_id, user_id: gameSettings['userId'] });

		useEffect(() => {
			socket.on('isHost', () => {
				setIsHost(true);
				console.log("You are player 1");
			});
			socket.on('startGame', () => {
				setGameJoined(true);
			});
		}, [socket]);
		return (
			<>
				{gameJoined ? <ThreeScene gameSettings={gameSettings} room_id={room_id} user_id={gameSettings.userId} isHost={isHost} gamemode={2} /> : <div>Loading game...</div>}
			</>
			)
	}
	else
	{
		return (
			<>
				<ThreeScene room_id={-1} user_id={gameSettings.userId} isHost={true} gamemode={0}/>
			</>
			)
	}
}