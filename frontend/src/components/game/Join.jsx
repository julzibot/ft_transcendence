'use client'

import { useEffect, useState, useContext } from "react";
import { useSocketContext } from "../../context/socket";
import ThreeScene from './Game';
import { Spinner } from 'react-bootstrap';

// Join is a component for Online Game
export default function Join({ userId, room, gameSettings, gameMode}) {

	const socket = useSocketContext();

		const [gameJoined, setGameJoined] = useState(false);
		const [isHost, setIsHost] = useState(false);
		const [player2_id, setPlayer2_id] = useState(null);


		useEffect(() => {
			socket.emit('join_room', { room_id: room, user_id: userId });
			console.log(`[${userId}] Joining room: ${room}`)

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
						<ThreeScene gameSettings={gameSettings} room_id={room} user_id={userId} player2_id={player2_id} isHost={isHost} gamemode={gameMode} />
					) : (
						<div className="d-flex justify-content-center align-items-center vh-100 text-light">
							<div className="flex-row align-items-center">
								<h1>Waiting for an opponent...</h1>
								<div className="p-5 text-primary" style={{marginLeft: "41px", marginBottom: "19px"}}>
								<Spinner animation="border" style={{ width: '15rem', height: '15rem', borderWidth: "45px", borderRightColor: "#ff0000", borderTopRightRadius:"75px", borderTopColor: '#26cc00', borderBottomColor: '#ffd700', animationDuration: "3s"}} />
								</div>
							</div>
						</div>
					)
				}
			</>
		)
}