"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/app/lib/AuthContext";
import useSocketContext from "@/context/socket";
import { BACKEND_URL } from "@/config";
import { User } from "@/types/Auth";
import styles from '../../GameSettingsStyles.module.css'

interface Lobby {
	id: number;
	name: string;
	linkToJoin: string;
	player1: User;
	player2: User | null;
}

export default function Lobby() {
	const { session } = useAuth();
	const router = useRouter();
	const { linkToJoin } = useParams();
	const [lobbyData, setLobbyData] = useState<Lobby | null>(null);
	const [isMounted, setIsMounted] = useState(false);
	const [players, setPlayers] = useState<{}>({
		player1: null,
		player2: null
	})
	const [isTranslated, setIsTranslated] = useState(false);
	const socket = useSocketContext();

	useEffect(() => {
		const getLobbyData = async () => {
			try {
				const response = await fetch(`${BACKEND_URL}/api/lobby/${linkToJoin}/`, {
					method: "GET",
					credentials: 'include'
				});
				if (!response.ok) {
					console.log('Error fetching tournament data')
					router.push(`/error?code=${response.status}`)
				}
				else {
					const data = await response.json()
					setLobbyData(data);
				}
			} catch (error) {
				console.error('Error fetching tournament data:', error)
				throw error
			}
		}
		getLobbyData()
	}, [])

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsMounted(true);
		}, 1000);
		return () => clearTimeout(timer)
	}, []);

	useEffect(() => {
		if (socket && session) {
			socket.emit('joinRoom', {
				lobbyId: linkToJoin,
				user: {
					id: session.user.id,
					username: session.user.username,
					image: session.user.image
				}
			})

			socket.on('updatedPlayers', (data: {}) => {
				setPlayers(data)
			})
		}
	}, [socket, session])

	const renderPlayer = (player: User) => {
		return (
			<div
				className={`d-flex flex-row align-items-center fw-bold fs-5`}
				style={{ height: '50px' }}
			>
				<div className="justify-content-center col d-flex align-items-center">
					<div className="d-flex flex-row align-items-center">
						<span className="me-2 text-truncate" style={{ maxWidth: 'calc(80%)' }}>{player.username}</span>
						< div className="ms-2 position-relative border border-2 border-dark-subtle rounded-circle" style={{ width: '30px', height: '30px', overflow: 'hidden' }}>
							<img
								style={{
									objectFit: 'cover',
									width: '100%',
									height: '100%',
									position: 'absolute',
									top: '50%',
									left: '50%',
									transform: 'translate(-50%, -50%)'
								}}
								fetchPriority="high"
								alt="profile picture"
								src={`${BACKEND_URL}${player.image}`}
							/>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<>
			<div className="d-flex flex-column align-items-center justify-content-center mt-3">
				<div className={`card mt-1 mb-4 m-2 p-1 ps-4 pe-4  ${styles.pageTitle} ${isMounted ? styles.mounted : ''}`}>
					<div className="card-title text-center">
						<h2 className="mt-3 fw-bold">{lobbyData?.name}</h2>
					</div>
				</div>
			</div>
			<div className={`card mt-3 col-4 ${styles.gameSettingsCard} ${isTranslated ? styles.translated : ''} ${isMounted ? styles.mounted : ''}`}>
				<div className="card-body">
					<h1>In Lobby</h1>
					<div className="mt-2 border">
						{players.player1 && renderPlayer(players.player1)}
						<hr />
						{players.player2 && renderPlayer(players.player2)}
					</div>
				</div>
			</div>
		</>
	)
}