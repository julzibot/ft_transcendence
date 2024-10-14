import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { GetTournamentData, CreateTournament, joinTournament } from '@/services/tournaments';
import { useAuth } from '@/app/lib/AuthContext';
import DOMPurify from 'dompurify';
import { GameSettingsType } from '@/types/GameSettings';
import { TournamentSettingsType } from '@/types/TournamentSettings'
import { PersonFillUp, Controller, Toggle2On, Toggle2Off, LightningFill, ClockFill } from 'react-bootstrap-icons'
import { BACKEND_URL } from '@/config';
import Link from 'next/link'
import { CustomTooltip } from '../Utils/Tooltip';
import { useRouter } from 'next/navigation'
import { useSocketContext } from '@/context/socket';

interface Tournament {
	id: number;
	name: string,
	points_to_win: number,
	game_difficulty: number,
	power_ups: boolean,
	maxPlayerNumber: number;
	timer: number;
}

interface GameSettingsProps {
	setGameSettings: Function,
	setToastShow: Function,
	setErrorField: Function,
	errorField: {
		joinError: string
	},
	gameSettings: GameSettingsType
}

export default function Tournament({ setGameSettings, gameSettings, setToastShow, setErrorField, errorField }: GameSettingsProps) {
	const socket = useSocketContext()
	const { session } = useAuth()
	const router = useRouter()

	const [tournamentData, setTournamentData] = useState<Tournament[] | null>([])
	const [modalShow, setModalShow] = useState(false);
	const [tournamentForm, setTournamentForm] = useState<TournamentSettingsType>({
		name: '',
		maxPlayerNumber: 4,
		timer: 15
	})


	const handleJoin = async (tournamentId: number, userId: number, linkToJoin: string) => {
		try {
			await joinTournament(tournamentId, userId)
			socket.emit('updateTournament', tournamentId)
			// router.push(`/tournaments/${linkToJoin}`)
		}
		catch (error: any) {
			setErrorField({ ...errorField, joinError: error.message })
			setToastShow(true)
		}
	}

	const submitTournament = async () => {
		const payload = {
			'name': tournamentForm.name,
			'maxPlayerNumber': tournamentForm.maxPlayerNumber,
			'timer': 10,
			'difficultyLevel': gameSettings.game_difficulty,
			'pointsPerGame': gameSettings.points_to_win,
			'power_ups': gameSettings.power_ups,
			'creator': session.user.id
		}
		await CreateTournament(payload)
		setModalShow(false)
	}


	useEffect(() => {
		const fetchData = async () => {
			try {
				const tournaments = await GetTournamentData()
				setTournamentData(tournaments)
			} catch (error) {
				console.error('Error :', error)
			}
		}
		socket.on('updateTournament', () => {
			fetchData()
		})
		socket.emit('Enter_Tournaments_lobby', { userId: session.user.id })
		fetchData()
		return () => {
			socket.emit('Leave_Tournaments_lobby', { userId: session.user.id })
		}
	}, [])


	return (
		<>
			<div className='d-flex justify-content-center'>
				<div className='w-100 border rounded p-4' style={{ maxWidth: '800px' }}>
					<div className='d-flex align-items-center justify-content-between border-bottom pb-3'>
						<h3 className='mb-0 me-4'>Tournament Lobbies</h3>
						<Button className="btn btn-outline-light me-md-2" type='button' onClick={() => setModalShow(true)}>Create</Button>
					</div>
					<div className='w-100 pt-2' >
						<div className='d-flex flex-column align-items-center'>
							{
								tournamentData && tournamentData.map((tournament: TournamentSettingsType, index: number) => {
									return (
										<div key={index} className="d-flex align-items-center border-top">
											<div className="d-flex flex-column">
												{tournament.name}
											</div>
											<div className="d-flex flex-column align-items-center justify-content-evenly border-start border-end p-2">
												<div className="d-flex flex-row align-items-center">
													<span>{tournament.creator.username}</span>
													<Link href={`/account/${tournament.creator.id}`}>
														< div className="ms-2 position-relative border border-2 border-dark-subtle rounded-circle" style={{ width: '18px', height: '18px', overflow: 'hidden' }}>
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
																src={`${BACKEND_URL}${tournament.creator.image}`}
															/>
														</div>
													</Link>
												</div>
												<CustomTooltip text="Created by" position="bottom">
													<PersonFillUp
														size={15}
														color={'green'} />
												</CustomTooltip>
											</div>
											<div className="d-flex flex-column align-items-center justify-content-evenly border-end p-2">
												<span className="fw-bold">{tournament.numberOfPlayers} / {tournament.maxPlayerNumber}</span>
												<CustomTooltip text="Players in Lobby" position="bottom">
													<Controller size={15} />
												</CustomTooltip>
											</div>
											<div className="d-flex flex-column align-items-center justify-content-evenly border-end p-2">
												<span className="fw-bold">
													Power Ups
												</span>
												<span>

													<LightningFill className="me-1" size={15} />
													{
														tournament.power_ups ? (<Toggle2On size={15} color={'green'} />) : (<Toggle2Off size={15} color={'red'} />)
													}
												</span>
											</div>
											<div className="d-flex flex-column align-items-center justify-content-evenly border-end p-2">
												<span className="fw-bold">Duration</span>
												<div className="d-flex flex-row align-items-center">
													<ClockFill size={15} />
													<span className="ms-1">{tournament.timer}'</span>
												</div>
											</div>
											<div className="p-3 border-end">

												{
													!tournament.isStarted && <button className="btn btn-warning" onClick={() => handleJoin(tournament.id, session.user.id, tournament.linkToJoin)}>Join</button>
												}
											</div>
										</div>
									)
								})
							}
						</div>
					</div>
				</div >


				<Modal
					show={modalShow}
					onHide={() => setModalShow(false)}
					size="lg"
					aria-labelledby="contained-modal-title-vcenter"
					centered
				>
					<Modal.Header closeButton>
						<Modal.Title id="contained-modal-title-vcenter">
							Select Game Customizations
						</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<form>
							<div className="mb-3 text-center">
								<label className="form-label">Name</label>
								<span className='text-danger'>*</span>
								<input type="text" className="form-control" value={tournamentForm.name} onChange={(e) => setTournamentForm({ ...tournamentForm, name: (DOMPurify.sanitize(e.target.value)) })} />
							</div>
							<div className="mb-3 align-items-center text-center">
								<label className="form-label">Max Number of Players
									<span className='text-danger'>*</span>
								</label>
								<div className='text-primary m-2 d-flex text-center align-items-center justify-content-center'>
									{tournamentForm.maxPlayerNumber}
								</div>
								<input
									type="range"
									className="form-range"
									min="3"
									max="8"
									step="1"
									id="pointsRange"
									value={tournamentForm.maxPlayerNumber}
									onChange={(e) => setTournamentForm({ ...tournamentForm, maxPlayerNumber: parseInt(e.target.value) })}
								/>
							</div>
							<div className="mb-3 align-items-center text-center">
								<label className="form-label">Points Per Game
									<span className='text-danger'>*</span>
								</label>
								<div className='text-primary m-2 d-flex3 text-center align-items-center justify-content-center'>
									{gameSettings.points_to_win}
								</div>
								<input
									type="range"
									className="form-range"
									min="1"
									max="21"
									step="1"
									id="pointsRange"
									value={gameSettings.points_to_win}
									onChange={(e) => setGameSettings({ ...gameSettings, points_to_win: parseInt(e.target.value) })}
								/>
							</div>
							<div className="align-items-center text-center">
								<label className="form-label">Timer (in minutes)
									<span className='text-danger'>*</span>
								</label>
								<div className='text-primary m-2 d-flex3 text-center align-items-center justify-content-center'>
									{tournamentForm.timer}
								</div>
								<input
									type="range"
									className="form-range"
									min="3"
									max="30"
									step="1"
									id="pointsRange"
									value={tournamentForm.timer}
									onChange={(e) => setTournamentForm({ ...tournamentForm, timer: parseInt(e.target.value) })}
								/>
							</div>
							<div className="mb-3">
								<label className="form-label">Difficulty Level*</label>
								<select
									className="form-select"
									aria-label="Game Difficulty"
									value={gameSettings.game_difficulty}
									onChange={(e) =>
										setGameSettings({ ...gameSettings, game_difficulty: parseInt(e.target.value) })
									}
								>
									<option value="">Select Game Difficulty</option>
									<option value={1}>Granny</option>
									<option value={2}>Boring</option>
									<option value={3}>Still Slow</option>
									<option value={4}>Kinda OK</option>
									<option value={5}>Now We're Talking</option>
									<option value={6}>Madman</option>
									<option value={7}>Legend</option>
								</select>
							</div>
							<div className='d-flex items-center flex-wrap'>
								<div className="mb-3 form-check form-switch">
									<input
										className="form-check-input"
										type="checkbox"
										role="switch"
										id="flexSwitchCheckChecked"
										checked={gameSettings.power_ups}
										onChange={(e) => setGameSettings({ ...gameSettings, power_ups: e.target.checked })}
									/>
									<label className="form-check-label">Power ups</label>
								</div>
							</div>
						</form>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={() => setModalShow(false)}>Close</Button>
						<Button variant="primary" onClick={submitTournament}>Add</Button>
					</Modal.Footer>
				</Modal>

			</div >

		</>
	)
}