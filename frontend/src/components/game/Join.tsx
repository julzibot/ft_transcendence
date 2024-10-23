'use client'

import { useEffect, useState } from "react";
import useSocketContext from "@/context/socket";
import useSocketContext from "@/context/socket";
import ThreeScene from './Game';
import { Spinner } from 'react-bootstrap';
import "./styles.css"
import { GameSettings } from "@/types/Game";
import { BACKEND_URL } from "@/config/index";
import Cookies from "js-cookie";

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
	const [isNotHost, setIsNotHost] = useState(false);
	const [player2_id, setPlayer2_id] = useState(null);
	const [gameCreated, setGameCreated] = useState(false); // POST game to backend
	const [matchFetched, setMatchFetched] = useState(false); // If gameCreated, GET match infos
	const [playerDisconnected, setPlayerDisconnected] = useState(false);
	const [gameEnded, setGameEnded] = useState<Boolean>(false);

	const handleGameEnded = () => {
		setGameEnded(true);
	}

	const [gameInfos, setGameInfos] = useState({
		game_id: -1,
		p1Name: '',
		p2Name: '',
		p1p: '',
		p2p: ''
	})

	useEffect(() => {
		if (socket) {
			socket.emit('join_room', { room_id: room, user_id: userId });
			if (socket) {
				socket.emit('join_room', { room_id: room, user_id: userId });

				socket.on('isHost', () => {
					setIsHost(true);
					console.log(`[${room}] You are player 1 [HOST]`);
				});
				socket.on('isHost', () => {
					setIsHost(true);
					console.log(`[${room}] You are player 1 [HOST]`);
				});

				socket.on('isNotHost', () => {
					setIsNotHost(true);
					console.log(`[${room}] You are player 2 [NOT HOST]`);
				})
				socket.on('isNotHost', () => {
					setIsNotHost(true);
					console.log(`[${room}] You are player 2 [NOT HOST]`);
				})

				socket.on('player2_id', (data) => {
					setPlayer2_id(data.player2_id);
					console.log(`[socket] data.player2_id ${data.player2_id}`);
				});
				socket.on('player2_id', (data) => {
					setPlayer2_id(data.player2_id);
					console.log(`[socket] data.player2_id ${data.player2_id}`);
				});

				socket.on('receiveGameId', (data) => {
					setGameInfos({ ...gameInfos, game_id: data.game_id });
				})
				socket.on('receiveGameId', (data) => {
					setGameInfos({ ...gameInfos, game_id: data.game_id });
				})

				socket.on('startGame', () => {
					console.log('Start the game!');
					setGameJoined(true);
				});
				socket.on('startGame', () => {
					console.log('Start the game!');
					setGameJoined(true);
				});

				socket.on('playerDisconnected', () => {
					console.log('The other player has disconnected');
					setPlayerDisconnected(true);
				})
				socket.on('playerDisconnected', () => {
					console.log('The other player has disconnected');
					setPlayerDisconnected(true);
				})
			}

			return () => {
				if (socket) {
					socket.off('isHost');
					socket.off('isNotHost');
					socket.off('receiveGameId');
					socket.off('player2_id');
					socket.off('startGame');
				};
			}
		}, [socket]);

	useEffect(() => {
		if (isHost && player2_id && !gameCreated) {
			const createGame = async () => {
				console.log('[Join] CreateGame called');
				const response = await fetch(BACKEND_URL + '/api/game/create', {
					method: 'POST',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
						'X-CSRFToken': Cookies.get('csrftoken') as string
					},
					body: JSON.stringify({
						'player1': userId,
						'player2': player2_id,
						'game_mode': 2
					})
				});
				if (response.status === 201) {
					const res = await response.json();
					setGameInfos({ ...gameInfos, game_id: parseInt(res.id) });
					socket?.emit('sendGameId', { room_id: room, game_id: res.id });
					setGameCreated(true); // now GET match info
				}
				else
					console.log('[Join] Error: ' + response.status);
			}
			createGame();
		}
	}, [isHost, player2_id]);

	useEffect(() => {
		if (isNotHost || (gameCreated && !matchFetched)) {
			const fetchGameInfos = async (game_id: number) => {
				const response = await fetch(BACKEND_URL + `/api/game/history/${game_id}`, {
					method: 'GET',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' }
				})
				if (response.ok) {
					const res = await response.json();
					const data = res.data;
					setGameInfos({
						...gameInfos,
						p1Name: data.player1.username,
						p2Name: data.player2.username,
						p1p: data.player1.image,
						p2p: data.player2.image
					});
					socket?.emit('fetchFinished', { room_id: room });
					setMatchFetched(true);
				}
				else
					console.log('[Join] [fetchGameInfos] Error fetching: ' + response.status);
			}
			fetchGameInfos(gameInfos.game_id);
		}
		// send to socket.io server to start the game
	}, [gameCreated, gameInfos.game_id]);

	return (
		<>
			{
				playerDisconnected ? (<h2>player disconnected</h2>) : (userId && gameJoined ? (
					<ThreeScene gameInfos={gameInfos} gameSettings={gameSettings} room_id={room} user_id={userId} isHost={isHost} gamemode={gameMode} handleGameEnded={() => { /* handle game end logic here */ }} />
				) : (
					<div className="d-flex justify-content-center align-items-center text-light pt-5 mt-5">
						<p>{JSON.stringify(gameInfos)}</p>
						<div className="flex-row align-items-center mt-5">
							<h1>Waiting for an opponent</h1>
							<div className="p-5 text-primary" style={{ marginLeft: "41px", marginBottom: "19px", marginTop: "40px" }}>
								<Spinner animation="border" style={{ width: '15rem', height: '15rem', borderWidth: "45px", borderRightColor: "#ff0000", borderTopRightRadius: "75px", borderTopColor: '#26cc00', borderBottomColor: '#ffd700', animationDuration: "15s" }} />
							</div>
						</div>
					</div>
				))
			}
		</>
	)
}