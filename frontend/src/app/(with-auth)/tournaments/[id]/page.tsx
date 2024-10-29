"use client";

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/app/lib/AuthContext';
import { BACKEND_URL } from '@/config';
import { ParticipantType, TournamentType } from '@/types/TournamentSettings';
import styles from '../GameSettingsStyles.module.css'
import { Controller, TrophyFill } from 'react-bootstrap-icons'
import useSocketContext from '@/context/socket';
import { Pair } from '@/types/TournamentSettings';
import { AddLobbyData, JoinLobby } from '@/services/onlineGames';
import { LobbyPayload } from '@/types/Lobby';
import { startTournament } from '@/services/tournaments';
import "./styles.css"


export default function TournamentLobby() {
	const { id } = useParams();
	const { session } = useAuth();
	const router = useRouter();
	const videoRef = useRef()
	const [participantsList, setParticipantsList] = useState<ParticipantType[]>([]);
	const [pairs, setPairs] = useState<Pair[]>()
	const [tournamentData, setTournamentData] = useState<TournamentType>();
	const [isMounted, setIsMounted] = useState(false);
	const [isTranslated, setIsTranslated] = useState(false);
	const socket = useSocketContext();
	const [isReady, setIsReady] = useState(false);

	const handleStartTournament = async () => {
		//update isStarted in DB to prevent user to enter and to continue match making
		await startTournament(id)

		// send signal to sockets
		socket.emit('startTournament', { tournamentId: id, tournamentDuration: tournamentData.timer })

	}

	useEffect(() => {
		if (session && tournamentData) {
			setIsReady(true);
		}
	}, [isReady, session, tournamentData]);

	useEffect(() => {
		if (videoRef.current) {
			videoRef.current.playbackRate = 1.2; // Adjust the speed here (e.g., 0.5 is half-speed, 2 is double-speed)
		}
	}, []);


	useEffect(() => {
		const fetchTournamentData = async () => {
			const response = await fetch(`${BACKEND_URL}/api/tournament/${id}/`, {
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
			})
			if (response.ok) {
				const data = await response.json()
				setParticipantsList(data.participants)
				setTournamentData(data.tournament)
			}
			else {
				router.push(`/error?code=${response.status}`)
			}
		}
		fetchTournamentData()
	}, [])

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsMounted(true);
		}, 1000);
		return () => clearTimeout(timer)
	}, []);

	useEffect(() => {
		if (session && socket) {
			socket.emit('joinTournament', {
				tournamentId: id,
				user: {
					id: session?.user.id,
					username: session?.user.username,
					image: session?.user.image
				}
			})
		}
	}, [session, socket, id]);

	useEffect(() => {
		if (socket && isReady) {
			socket.on('updateParticipants', (data: ParticipantType[]) => {
				setParticipantsList(data);
			})
			socket.on('getMatchPair', async (data: Pair[]) => {
				setPairs(data);
				//find the pair that the user is in
				const pair = data.find(pair => pair.player1.id === session?.user?.id || pair.player2.id === session?.user?.id);
				if (pair?.player1.id === session?.user?.id) {
					const payload: LobbyPayload = {
						name: `${pair?.player1.username} vs ${pair?.player2.username}`,
						player1: session?.user?.id,
						difficultyLevel: tournamentData?.difficultyLevel,
						pointsPerGame: tournamentData?.pointsPerGame,
						power_ups: tournamentData?.power_ups,
						gameMode: 'TOURNAMENT',
						tournamentLink: id
					}
					//Create a lobby with payload
					const linkToJoin = await AddLobbyData(payload);
					//Send the link to the other player
					socket.emit('sendLink', {
						tournamentId: id,
						linkToJoin: linkToJoin,
						receiver: pair?.player2
					});
					// Push to the lobby
					socket.emit('tournamentGameEntered', { tournamentId: id, userId: pair?.player1.id, oppId: pair?.player2.id })
					router.push('/game/online/lobby/' + linkToJoin);
				}
				else {
					socket.on('receiveLink', async (data: { linkToJoin: string, receiverId: number }) => {
						// do Not simply push to the lobby, but join using JoinLobbyView API in the backend ()
						if (data.receiverId === session?.user?.id) {
							await JoinLobby(data.linkToJoin, session.user.id);
							socket.emit('tournamentGameEntered', { tournamentId: id, userId: pair?.player2.id, oppId: pair?.player1.id })
							router.push('/game/online/lobby/' + data.linkToJoin);
						}
					})
				}
			})
		}
		return () => {
			socket?.off('updateParticipants');
			socket?.off('getMatchPair');
			socket?.off('receiveLink');
		}
	}, [socket, isReady]);

	useEffect(() => {
		if (tournamentData && tournamentData.isStarted) {
			console.log(tournamentData);
			socket.emit("returnToLobby", { tournamentId: id, userId: session.user.id })
		}
	}, [tournamentData])
	return (
		<>
			<div className="d-flex flex-column align-items-center justify-content-center mt-3">
				<div className={`card mt-1 mb-4 m-2 p-1 ps-4 pe-4  ${styles.pageTitle} ${isMounted ? styles.mounted : ''}`}>
					<div className="card-title text-center">
						<h2 className="mt-3 fw-bold">{tournamentData?.name}</h2>
					</div>
				</div>
			</div>
			<div className="d-flex position-relative">
				<div className={`d-flex card mt-3 col-3 ${styles.gameSettingsCard} ${isTranslated ? styles.translated : ''} ${isMounted ? styles.mounted : ''}`}>
					<div className="card-body">
						<h1>In Lobby</h1>
						<div className="mt-2 border">
							{
								participantsList && participantsList.map((participant: ParticipantType, index: number) => {
									return (
										<div
											key={index}
											className={`${participantsList.length - 1 === index ? 'border-bottom' : ''} ${index === 0 ? '' : 'border-top'} d-flex flex-row align-items-center fw-bold fs-5`}
											style={{ height: '70px' }}
										>
											<div className="border-end justify-content-center col-8 d-flex align-items-center">
												<div className="d-flex flex-row align-items-center">
													<span className="me-2 text-truncate" style={{ maxWidth: 'calc(80%)' }}>{participant.user.username}</span>
													< div className="ms-2 position-relative border border-2 border-dark-subtle rounded-circle" style={{ width: '50px', height: '50px', overflow: 'hidden' }}>
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
															src={`${BACKEND_URL}${participant.user.image}`}
														/>
													</div>
												</div>
											</div>
											<div className="border-end col-2 d-flex justify-content-center align-items-center">
												<TrophyFill size={15} />
												<span className="ms-2">{participant.wins}</span>
											</div>
											<div className="col-2 d-flex justify-content-center align-items-center">
												<Controller size={15} />
												<span className="ms-2">{participant.gamesPlayed}</span>
											</div>
										</div>
									)
								})
							}
						</div>
					</div>
				</div>
				{
					pairs &&
					<div className="card position-relative mt-5 z-1 match-card border-2 rounded-5 col-4 position-absolute translate-middle-x start-50" style={{ height: '500px' }}>
						<div className="video-container">
							<video
								className="background-video rounded-5"
								autoPlay
								muted
								loop
								ref={videoRef}
								src="/videos/flame.mp4"
							>
								Your browser does not support HTML5 video.
							</video>
						</div>
						<div className="card-body">
							<h1 className="card-title text-center text-light flame-text">Fighting Pit</h1>
							<div className="mt-5 d-flex position-relative justify-content-between">
								<div className="d-flex flex-column position-asbolute col-5 top-0 start-0 opacity">
									{pairs && pairs.map((pair) => (
										<>
											<div key={pair.id} className="text-light border bg-transparent mb-1 d-flex rounded-start-4 shadow col-12 align-items-center justify-content-around" style={{ height: '70px' }}>
												< div className="col-5 position-relative border border-2 border-dark-subtle rounded-circle shadow-lg" style={{ width: '50px', height: '50px', overflow: 'hidden' }}>
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
														src={`${BACKEND_URL}${pair.player1.image}`}
													/>
												</div>
												<span className="col-7 text-truncate fs-3" style={{ maxWidth: 'calc(80%)' }}>{pair.player1.username}</span>
											</div>
										</>
									))}
								</div>
								<div className="flame-text-container position-absolute p-3  top-50 start-50 translate-middle">
									<span className="flame-text fw-bolder fs-1">VS</span>
								</div>
								<div className="d-flex flex-column col-5 position-asbolute top-0 end-0">
									{pairs && pairs.map((pair, index) => (
										<>
											<div key={index} className=" text-light border bg-transparent mb-1 bg-light d-flex rounded-end-4 shadow col-12 align-items-center justify-content-around" style={{ height: '70px' }}>
												<span className="col-7 text-end text-truncate fs-3" style={{ maxWidth: 'calc(60%)' }}>{pair.player2.username}</span>
												< div className="col-5 position-relative border border-2 border-dark-subtle rounded-circle" style={{ width: '50px', height: '50px', overflow: 'hidden' }}>
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
														src={`${BACKEND_URL}${pair.player2.image}`}
													/>
												</div>
											</div>
										</>
									))}
								</div>
							</div>
						</div>
					</div>
				}
			</div >
			{
				tournamentData && tournamentData.creator.id === session?.user?.id && !tournamentData.isStarted &&
				<button className="btn btn-primary" onClick={handleStartTournament}>
					Start Tournament
				</button >
			}
		</>
	)
}