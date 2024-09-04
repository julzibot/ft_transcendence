'use client'

import { useEffect, useState, useContext } from "react";
import { useSocketContext } from "../../context/socket";
import ThreeScene from './Game';
import { Spinner } from 'react-bootstrap';
import "./styles.css"
import { GameSettings } from "@/types/GameSettings";
import { BASE_URL } from "@/utils/constants";

interface JoinProps {
	userId: number,
	room: string,
	gameSettings: GameSettings,
	gameMode: number
}

// Join is a component for Online Game
export default function Join({ userId, room, gameSettings, gameMode }: JoinProps) {

	const socket = useSocketContext();

	const [gameJoined, setGameJoined] = useState(false);
	const [isHost, setIsHost] = useState(false);
	const [player2_id, setPlayer2_id] = useState(null);
	const [gameCreated, setGameCreated] = useState(false);

	const [gameInfos, setGameInfos] = useState({
		game_id: -1,
		p1Name: '',
		p2Name: '',
		p1p: '',
		p2p: ''
	})


	useEffect(() => {
		socket.emit('join_room', { room_id: room, user_id: userId });
		console.log(`[${userId}] Joining room: ${room}`)

		socket.on('isHost', () => {
			setIsHost(true);
			console.log("You are player 1");
		});
		
		if (isHost) {
			socket.on('player2_id', (data) => {
				setPlayer2_id(data.player2_id);
			});
		}

		socket.on('startGame', () => {
			setGameJoined(true);
		});

		return () => {
			socket.off('isHost');
			socket.off('player2_id');
			socket.off('startGame');
		};
	}, [socket]);

	const fetchGameInfos = async (game_id : number) => {
		const response = await fetch(BASE_URL + `game/history/${game_id}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		})
		if (response.ok) {
			const res = await response.json();
			const data = res.data;
			setGameInfos({...gameInfos,
				p1Name: data.player1.username,
				p2Name: data.player2.username,
				p1p: data.player1.image,
				p2p: data.player2.image
			})
		}
		else
			console.log('[Join] [fetchGameInfos] Error fetching: ' + response.status);
	}

	useEffect(() => {
		if (isHost && !gameCreated) {
			const createGame = async () => {
				console.log('[Join] CreateGame called');
					const response = await fetch(BASE_URL + 'game/create', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
					'player1': userId,
					'player2': player2_id,
					'game_mode': 2
					})
				});
				if (response.status === 201) {
					const res = await response.json();
					setGameInfos({...gameInfos, game_id: parseInt(res.id)});
					fetchGameInfos(gameInfos.game_id);
				}
				else
					console.log('[Join] Error: ' + response.status);
			}
			createGame();
			setGameCreated(true);
		}
	}, [player2_id]);

	return (
		<>
			{userId && gameJoined ? (
				// gamemode hardcoded to 2 for now - speak to Jules about handling online/tournament modes

				// game_id
				// player1 & player2 = username + image
				<ThreeScene gameSettings={gameSettings} room_id={room} user_id={userId} player2_id={player2_id} isHost={isHost} gamemode={gameMode} />
			) : (
				<div className="d-flex justify-content-center align-items-center text-light pt-5 mt-5">
					<div className="flex-row align-items-center mt-5">
						<h1>Waiting for an opponent
							{/* 
							<h1 className="loading">
								<span>.</span><span>.</span><span>.</span>
							</h1> */}
						</h1>
						<div className="p-5 text-primary" style={{ marginLeft: "41px", marginBottom: "19px", marginTop: "40px" }}>
							<Spinner animation="border" style={{ width: '15rem', height: '15rem', borderWidth: "45px", borderRightColor: "#ff0000", borderTopRightRadius: "75px", borderTopColor: '#26cc00', borderBottomColor: '#ffd700', animationDuration: "15s" }} />
						</div>
					</div>
				</div>
			)
			}
		</>
	)
}