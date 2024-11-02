"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/app/lib/AuthContext";
import useSocketContext, { SocketProvider } from "@/context/socket";
import { BACKEND_URL } from "@/config";
import { User } from "@/types/Auth";
import { FinalSettings } from "@/types/Game";
import GameCountdownModal from "@/components/cards/GameCountdownModal";
import WaitingLobbyModal from "@/components/cards/WaitingLobbyModal";
import ThreeScene from "@/components/game/Game";
import EndGameCard from "@/components/cards/EndGameCard";

interface GameInfos {
	game_id: number,
	game_mode: number,
	player1: User,
	player2: User,
}

interface Players {
	player1: User,
	player2: User
}

interface Lobby {
	id: number;
	name: string;
	linkToJoin: string;
	player1: User;
	player2: User | null;
	gameMode: 'TOURNAMENT' | 'ONLINE';
}

export default function Lobby() {
	const { session } = useAuth();
	const router = useRouter();
	const { linkToJoin } = useParams();

	const [lobbyData, setLobbyData] = useState<Lobby | null>(null);
	const [players, setPlayers] = useState<Players>()
	const [gameInfos, setGameInfos] = useState<GameInfos>()
	const [countdown, setCountdown] = useState<number>(3);
	const [gameSettings, setGameSettings] = useState<FinalSettings>();
	const [gameEnded, setGameEnded] = useState<boolean>(false);
	const [start, setStart] = useState<boolean>(false);
	const socket = useSocketContext();

	useEffect(() => {
		const getLobbyData = async () => {
			try {
				const response = await fetch(`${BACKEND_URL}/api/lobby/${linkToJoin}/`, {
					method: "GET",
					credentials: 'include'
				});
				if (!response.ok) {
					router.replace(`/error?code=${response.status}`)
				}
				else {
					const data = await response.json()
					setLobbyData(data);
					setGameSettings((prevSettings: any) => ({
						...prevSettings,
						game_difficulty: data.difficultyLevel,
						points_to_win: data.pointsPerGame,
						power_ups: data.power_ups
					}))
				}
			} catch (error) {
				console.error('Error fetching tournament data:', error)
				throw error
			}
		}
		getLobbyData()
	}, [])

	useEffect(() => {
		if (socket && session) {
			socket.emit('joinRoom', {
				lobbyId: linkToJoin,
				user: {
					id: session?.user?.id,
					username: session?.user?.username,
					image: session?.user?.image
				}
			})

			socket.on('initGame', (data: any) => {
				setGameInfos(data)
			})
			socket.on('updatedPlayers', (data: Players) => {
				setPlayers(data)
			})
			socket.on('startGame', () => {
				setStart(true);

				socket.disconnect();
			});
			return () => {
				socket.disconnect();
			};
		}
		async function fetchGameCustoms(id: number | undefined) {
			const response = await fetch(`${BACKEND_URL}/api/gameCustomization/${id}`, {
				method: 'GET',
				credentials: 'include',
			});
			if (response.ok) {
				const data = await response.json();
				setGameSettings((prev: any) => ({
					...prev,
					bgColor: data.bgColor,
					palette: data.palette,
					opacity: data.opacity,
					sparks: data.sparks,
					background: data.background
				}))
			}
		}
		if (session)
			fetchGameCustoms(session?.user?.id);
	}, [socket, session])

	const handleGameEnded = () => {
		setGameEnded(true)
	}

	return (
		<>
			{socket && lobbyData &&
				<SocketProvider nsp="/game">
					{countdown !== 0 ? (
						(players
							&& players.player1
							&& players.player2
							&& gameInfos
							&& gameInfos.game_id) ? (
							<GameCountdownModal lobby_id={linkToJoin} game_id={gameInfos.game_id} players={players} countdown={countdown} setCountdown={setCountdown} />
						) : (<WaitingLobbyModal players={players} />)
					) : (start && session && gameSettings &&
						(
							<ThreeScene
								gameInfos={gameInfos}
								gameSettings={gameSettings}
								room_id={gameInfos?.game_id} user_id={session?.user?.id}
								isHost={(players?.player1?.id === session?.user?.id) ? true : false}
								gamemode={gameInfos?.game_mode} handleGameEnded={handleGameEnded} />
						)
					)}
					{gameEnded && <EndGameCard gameMode={lobbyData.gameMode} tournamentLink={lobbyData.tournamentLink ? lobbyData.tournamentLink : null} />}
				</SocketProvider>
			}
		</>
	)
}