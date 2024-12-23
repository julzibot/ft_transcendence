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
import { endTournament, leaveTournament, startTournament } from '@/services/tournaments';
import "./styles.css"
import Image from '@/components/Utils/Image';
import EndTournamentCard from '@/components/cards/EndTournamentCard';


export default function TournamentLobby() {
	const { id } = useParams();
	const { session } = useAuth();
	const router = useRouter();
	const [participantsList, setParticipantsList] = useState<ParticipantType[]>([]);
	const [pairs, setPairs] = useState<Pair[]>()
	const [tournamentData, setTournamentData] = useState<TournamentType>();
	const [isMounted, setIsMounted] = useState(false);
	const [isTranslated, setIsTranslated] = useState(false);
	const socket = useSocketContext();
	const [isReady, setIsReady] = useState(false);
	const [joined, setJoined] = useState<boolean>(false);
	const [received, setReceived] = useState(false);
	const [sent, setSent] = useState(false);
	const [isStarting, setIsStarting] = useState(false);
	const [endTournamentCardShow, setEndTournamentCardShow] = useState<boolean>(false);
	const [opponentLeft, setOpponentLeft] = useState<number>(-1);
	let timer: any;

	const handleLeaveTournament = async () => {
		await leaveTournament(id as string, session?.user?.id)
		socket?.emit('unregister', { tournamentId: id, userId: session?.user?.id })
		router.replace('/tournaments')
	}

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
			if (data.participants.some((participant: ParticipantType) => Number(participant.user.id) === session?.user?.id)) {
				setParticipantsList(data.participants)
				setTournamentData(data)
			} else
				router.replace('/error?code=403')
		}
		else {
			router.replace(`/error?code=${response.status}`)
		}
	}

	const handleStartTournament = async () => {
		if (participantsList.length < 2) {
			return;
		}
		await startTournament(id.toString()) //update isStarted in DB to prevent user to enter and to continue matchmaking
		fetchTournamentData() //updates tournamentData
		setIsStarting(true);
		socket?.emit('startTournament', { tournamentId: id, tournamentDuration: tournamentData?.timer })
	}

	useEffect(() => {
		if (tournamentData) {
			setIsReady(true);
		}
	}, [isReady, tournamentData]);


	useEffect(() => {
		if (session)
			fetchTournamentData()
	}, [session])

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsMounted(true);
		}, 1000);
		return () => clearTimeout(timer)
	}, []);

	useEffect(() => {
		if (session && socket && !joined) {
			socket.emit('joinTournament', {
				tournamentId: id,
				user: {
					id: session?.user?.id,
					username: session?.user?.username,
					image: session?.user?.image
				}
			})
			setJoined(true);
		}
	}, [session, socket, id]);

	useEffect(() => {
		if (opponentLeft != -1 && pairs) {
			const pair = pairs?.find((p: Pair) => p.player1.id === session?.user?.id || p.player2.id === session?.user?.id);
			if (pair?.player1?.id === opponentLeft || pair?.player2?.id === opponentLeft) {
				socket?.emit('returnToLobby', { tournamentId: id, userId: session?.user?.id });
				location.reload();
			}
		}
	}, [pairs, opponentLeft]);


	useEffect(() => {
		if (socket && isReady) {
			socket.on('announceTournamentEnd', async () => {
				//set IsFinished to backend
				await endTournament(id as string)
				setEndTournamentCardShow(true)
			})

			socket.on('tournamentStarted', () => {
				setIsStarting(true);
			})

			socket.on('opponentLeft', (data: { userId: number }) => {
				setOpponentLeft(data.userId)
			})

			socket.on('updateParticipants', (data: ParticipantType[]) => {
				setParticipantsList(data.sort((a, b) => {
					if (a.wins > b.wins) return -1;
					if (a.wins < b.wins) return 1;
					return a.gamesPlayed - b.gamesPlayed;
				}))
			})

			if (!sent && !received) {
				socket.on('getMatchPair', async (data: Pair[]) => {
					setPairs(data);
					//find the pair that the user is in
					const pair = data.find(pair => pair.player1.id === session?.user?.id || pair.player2.id === session?.user?.id);
					if (tournamentData && session?.user && session?.user?.id === pair?.player1.id) {
						const payload: LobbyPayload = {
							name: `${pair?.player1.username} vs ${pair?.player2.username}`,
							player1: session?.user?.id,
							difficultyLevel: tournamentData?.difficultyLevel,
							pointsPerGame: tournamentData?.pointsPerGame,
							power_ups: tournamentData?.power_ups,
							gameMode: 'TOURNAMENT',
							tournamentLink: id.toString()
						}
						//Create a lobby with payload
						const linkToJoin = await AddLobbyData(payload);
						//Send the link to the other player
						socket.emit('sendLink', {
							tournamentId: id,
							linkToJoin: linkToJoin,
							receiver: pair?.player2
						});
						setSent(true);
						socket.emit('tournamentGameEntered', { tournamentId: id, userId: pair?.player1.id, oppId: pair?.player2.id })
						timer = setTimeout(() => {
							router.replace(`${id}/lobby/${linkToJoin}`);
						}, 5000)
					}
					else if (tournamentData && session?.user && session?.user?.id === pair?.player2.id) {

						socket.on('receiveLink', async (data: { linkToJoin: string, receiverId: number }) => {
							// do Not simply push to the lobby, but join using JoinLobbyView API in the backend ()
							if (data.receiverId === session?.user?.id) {
								setReceived(true);
								await JoinLobby(data.linkToJoin, session.user.id);
								socket.emit('tournamentGameEntered', { tournamentId: id, userId: pair?.player2.id, oppId: pair?.player1.id })
								timer = setTimeout(() => {
									router.replace(`${id}/lobby/${data.linkToJoin}`);
								}, 5000)
							}
						});
					}
				})
			}
		}
		return () => {
			socket?.off('updateParticipants');
			socket?.off('getMatchPair');
			socket?.off('receiveLink');
			clearTimeout(timer)
		}
	}, [socket, isReady]);

	useEffect(() => { // Handles players that got back from a game
		if (tournamentData)
			if (socket && tournamentData && tournamentData.isStarted) {
				socket.emit('returnToLobby', { tournamentId: id, userId: session?.user?.id })
			}
	}, [tournamentData, socket])

	useEffect(() => {
		if (tournamentData && tournamentData.isFinished)
			setEndTournamentCardShow(true)
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
						<h1>Participants</h1>
						<div className="mt-2 border">
							{
								participantsList && participantsList.map((participant: ParticipantType, index: number) => {
									return (
										<div
											key={`${participant.user.id}-${index}`}
											className={`${participantsList.length - 1 === index ? 'border-bottom' : ''} ${index === 0 ? '' : 'border-top'} d-flex flex-row align-items-center fw-bold fs-5`}
											style={{ height: '70px' }}
										>
											<div className="border-end justify-content-center col-8 d-flex align-items-center">
												<div className="d-flex flex-row align-items-center">
													<span className="me-2 text-truncate" style={{ maxWidth: 'calc(80%)' }}>{participant.user.username}</span>
													<Image className="ms-2" src={participant.user.image} alt={participant.user.username} whRatio="50px" />
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
						<div className="mt-4 d-flex justify-content-between">

							{
								tournamentData && !tournamentData.isStarted && !isStarting &&
								< button className="btn btn-outline-danger btn-lg " onClick={handleLeaveTournament}>
									Unregister
								</button >
							}
							{
								tournamentData && tournamentData.creator.id === session?.user?.id && !tournamentData.isStarted &&
								<button className="btn btn-warning btn-lg" onClick={handleStartTournament}>
									Start Tournament
								</button >
							}
						</div>
					</div>
				</div>
				{
					(tournamentData?.isStarted || isStarting) &&
					<div className="card position-relative mt-5 z-1 match-card border-2 rounded-5 col-4 position-absolute translate-middle-x start-50" style={{ height: '500px' }}>
						<div className="position-absolute" style={{ width: "100%", height: "100%" }}>
							<video
								className="rounded-5 position-absolute translate-middle-y object-fit-cover z-n1 top-50"
								style={{ width: "100%", height: "100%" }}
								autoPlay
								muted
								loop
								src="/videos/flame.mp4"
							>
								Your browser does not support HTML5 video.
							</video>
						</div>
						<div className="card-body">
							<h1 className="card-title text-center text-light flame-text">Fighting Pit</h1>
							<div className="mt-5 d-flex position-relative justify-content-between">
								<div className="d-flex flex-column position-asbolute col-5 top-0 start-0 opacity">
									{pairs && pairs.map((pair, index) => (
										<div key={`${pair.player1.id}-${index}`} className="text-light border bg-transparent mb-1 d-flex rounded-start-4 shadow col-12 align-items-center justify-content-around" style={{ height: '70px' }}>
											<Image className="col-5" src={pair.player1.image} alt={pair.player1.username} whRatio="50px" />
											<span className="col-7 text-truncate fs-3" style={{ maxWidth: 'calc(80%)' }}>{pair.player1.username}</span>
										</div>
									))}
								</div>
								<div className="flame-text-container position-absolute p-3  top-50 start-50 translate-middle">
									{
										pairs && pairs.length > 0 && <span className="flame-text fw-bolder fs-1">VS</span>
									}
								</div>
								<div className="d-flex flex-column col-5 position-asbolute top-0 end-0">
									{pairs && pairs.map((pair, index) => (
										<div key={`${pair.player2.id}-${index}`} className=" text-light border bg-transparent mb-1 bg-light d-flex rounded-end-4 shadow col-12 align-items-center justify-content-around" style={{ height: '70px' }}>
											<span className="col-7 text-end text-truncate fs-3" style={{ maxWidth: 'calc(60%)' }}>{pair.player2.username}</span>
											<Image className="col-5" src={pair.player2.image} alt={pair.player2.username} whRatio="50px" />
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				}
			</div >
			{
				endTournamentCardShow && <EndTournamentCard participants={participantsList} tournamentId={id as string} />
			}
		</>
	)
}