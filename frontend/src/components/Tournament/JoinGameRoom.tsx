'use client'

import { useState, useEffect, useContext } from 'react';
import ThreeScene from '../game/Game';
import { useSocketContext } from "../../context/socket";
import { fetchGameSettings } from '../game/Customization';

export default function JoinGameRoom({ room_id, user_id }) {

	const socket = useSocketContext();
	const [userJoined, setUserJoined] = useState(false);
	const [receivedSettings, setReceivedSettings] = useState(false);
	const [gameSettings, setGameSettings] = useState({
		user_id: user_id,

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
		fetchGameSettings(user_id, setGameSettings, gameSettings);
		setReceivedSettings(true);
	}, [user_id]);

	const [gameJoined, setGameJoined] = useState(false);
	const [isHost, setIsHost] = useState(false);

	socket.emit('join_room', { room_id: room_id, user_id: user_id });

	useEffect(() => {
		socket.on('isHost', () => {
			setIsHost(true);
			console.log("You are player 1");
		});
		socket.on('startGame', () => {
			setGameJoined(true);
		});
	}, [socket]);

	const handleEnter = () => {
		setUserJoined(true);
	}

	return (
		receivedSettings ? (
			userJoined ? (
				<ThreeScene gameSettings={gameSettings} room_id={room_id} user_id={user_id} isHost={isHost} gamemode={2} />
			) : (
				<div className="d-flex justify-content-center m-2">
					<button type="button" className="btn btn-primary mx-3" onClick={handleEnter}>Enter</button>
				</div>
			)
		) : (
			<button className="btn btn-primary" type="button" disabled>
				<span className="spinner-grow spinner-grow-sm" aria-hidden="true"></span>
				<span role="status">Loading...</span>
			</button>
		)
	)
}