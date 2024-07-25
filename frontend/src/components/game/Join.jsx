'use client'

import { useEffect, useState, useContext } from "react";
import { SocketContext } from "../../../context/socket";
import ThreeScene from '../game/Game';

export default function Join({ gameMode, userId }) {

	const [receivedSettings, setReceivedSettings] = useState(false);
	const [gameSettings, setGameSettings] = useState({
		user_id: userId,

		background: 0, // 0 - 3 animated, 4 - 5 static
		palette: 0, // palette: 4 choices
		bgColor: '#ff0000',
		opacity: 80,
		sparks: true,

		gameDifficulty: 4,
		pointsToWin: 5,
		powerUps: true
	});

	useEffect(() => {
		const fetchSettings = async () => {
			if (userId) {
				const response = await fetch(`http://localhost:8000/api/gameCustomization/${userId}/`, {
					method: 'GET'
				});
				if (response.ok) {
					const fetched = await response.json();
					const data = fetched.data;
					setGameSettings({
						...gameSettings,
						user_id: userId,
						background: data.background,
						palette: data.palette,
						bgColor: data.bgColor,
						opacity: data.opacity,
						sparks: data.sparks
					});
				}
				setReceivedSettings(true);
			}
		}
		fetchSettings();
	}, [userId]);

	if (gameMode === 2) {
		const socket = useContext(SocketContext);

		const [gameJoined, setGameJoined] = useState(false);
		const [isHost, setIsHost] = useState(false);
		const room_id = 5;

		socket.emit('join_room', { room_id: room_id, user_id: userId });

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
				{receivedSettings && gameJoined ? <ThreeScene gameSettings={gameSettings} room_id={room_id} user_id={userId} isHost={isHost} gamemode={2} /> : <div>Loading game...</div>}
			</>
		)
	}
	else {
		return (
			<>
				{
					receivedSettings && <ThreeScene gameSettings={gameSettings} room_id={-1} user_id={userId} isHost={true} gamemode={gameMode} />
				}
			</>
		)
	}
}