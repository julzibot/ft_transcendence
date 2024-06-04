'use client'

import { useEffect, useState } from "react";

function makeid(length) {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
}

export default function Test({ socket, user_id }) {

  const [isHost, setIsHost] = useState(false);
	const [newPosition, setNewPosition] = useState("");

	const [room, setRoom] = useState("");
	const [playerPos, setPlayerPos] = useState("");

	// Buttons
	const joinRoom = () => {
		socket.emit("join_room", {room_id: room, user_id: user_id});
	};

	const sendPlayerPos = () => {
		console.log("[Room: " + room + "]: [" + user_id + "]'s position: '" + playerPos + "'");
		socket.emit("send_player_pos", {room_id: room, user_id, message: playerPos});
	};
	// *** *** ***

	useEffect(() => {
		socket.on("connect", () => {
			console.log("Me [" + user_id + "] connected to " + socket.id)
		})

		socket.on("isHost", (bool) => {
			if (bool)
				setIsHost(true);
		})

		return () => {
			// socket.disconnect()
		}
	}, [socket])

	useEffect(() => {
		socket.on('receive_player_pos', (data) => {
			console.log("AAAAAAAAAAAAAA");
			setNewPosition(data.message);
			console.log("Received from [" + data.user_id +  "]: " + data.message);
		});
	}, [socket]);

	return(
		<div className="d-flex flex-column align-items-center justify-content-center h-100 m-3 p-3">
			<input placeholder="Room number..." onChange={(event) => {
				setRoom(event.target.value);
			}} />
			<button className="btn btn-secondary" onClick={joinRoom}>Join Room</button>
			<input placeholder="Player position..." onChange={(event) => {
				setPlayerPos(event.target.value);
			}} />
			<button className="btn btn-primary" onClick={sendPlayerPos}>Send Player Position</button>
			{isHost && <p>Player 1: </p>}
			{!isHost && <p>Player 2: </p> }
			<p>{newPosition}</p>
		</div>
	)
}