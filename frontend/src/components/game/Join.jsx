'use client'

import { useEffect, useState, useContext } from "react";
import { SocketContext } from "../../../context/socket";
import ThreeScene from '../game/Game'


export default function Join({ user_id }) {
	
	const remote_game = false;
	if (remote_game === true)
	{
		const socket = useContext(SocketContext);

		const [gameJoined, setGameJoined] = useState(false);
		const [isHost, setIsHost] = useState(false);
		const room_id = 5;

		socket.emit('join_room', { room_id: room_id, user_id: user_id });

		useEffect(() => {
			socket.on('isHost', () => {
				setIsHost(true);
				console.log("You are player 1");
			})
			socket.on('startGame', () => {
				setGameJoined(true);
			})
		}, [socket]);
	return (
		<>
			{gameJoined ? <ThreeScene room_id={room_id} user_id={user_id} isHost={isHost} gamemode={2} /> : <div>Loading game...</div>}
		</>
		)
	}
	else
	{
		return (
			<>
				<ThreeScene room_id={-1} user_id={user_id} isHost={true} gamemode={0}/>
			</>
			)
	}
}