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
	const [isNotHost, setIsNotHost] = useState(false);
	const [player2_id, setPlayer2_id] = useState(null);
	const [gameCreated, setGameCreated] = useState(false); // POST game to backend
	const [matchFetched, setMatchFetched] = useState(false); // If gameCreated, GET match infos

	const [gameInfos, setGameInfos] = useState({
		game_id: -1,
		p1Name: '',
		p2Name: '',
		p1p: '',
		p2p: ''
	})

	useEffect(() => {
		socket.emit('join_room', { room_id: room, user_id: userId });
		console.log(`[${room}] ${userId} has joined`)

		socket.on('isHost', () => {
			setIsHost(true);
			console.log(`[${room}] You are player 1 [HOST]`);
		});

		socket.on('isNotHost', () => {
			setIsNotHost(true);
			console.log(`[${room}] You are player 2 [NOT HOST]`);
		})

		socket.on('player2_id', (data) => {
			setPlayer2_id(data.player2_id);
			console.log(`[socket] data.player2_id ${data.player2_id}`);
		});

		socket.on('receiveGameId', (data) => {
			setGameInfos({ ...gameInfos, game_id: data.game_id });
		})

		socket.on('startGame', () => {
			console.log('Start the game!');
			setGameJoined(true);
		});

		return () => {
			socket.off('isHost');
			socket.off('player2_id');
			socket.off('startGame');
		};
	}, [socket]);

	useEffect(() => {
		console.log('[useEffect] before if - isHost [' + isHost + '] gameCreated [' + gameCreated + '] player2ID [' + player2_id + ']');
		if (isHost && player2_id && !gameCreated) {
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
					console.log(`Game ID: ${res.id}`);
					setGameInfos({ ...gameInfos, game_id: parseInt(res.id) });
					socket.emit('sendGameId', { room_id: room, game_id: res.id });
					setGameCreated(true); // now GET match info
				}
				else
					console.log('[Join] Error: ' + response.status);
			}
			createGame();
		}
	}, [isHost, player2_id]);

	useEffect(() => {
		console.log('[useEffect] before if - gameCreated [' + gameCreated + '] matchFetched [' + matchFetched + ']');
		if (isNotHost || (gameCreated && !matchFetched)) {
			console.log('[useEffect] after if');
			const fetchGameInfos = async (game_id: number) => {
				const response = await fetch(BASE_URL + `game/history/${game_id}`, {
					method: 'GET',
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
					socket.emit('fetchFinished', { room_id: room });
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
			{userId && gameJoined ? (
				<p>{JSON.stringify(gameInfos)}</p>
				// <ThreeScene gameInfos={gameInfos} gameSettings={gameSettings} room_id={room} user_id={userId} isHost={isHost} gamemode={gameMode} />
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
			)
			}
		</>
	)
}