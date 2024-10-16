import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { GetTournamentData, CreateTournament, joinTournament } from '@/services/tournaments';
import { useAuth } from '@/app/lib/AuthContext';
import DOMPurify from 'dompurify';
import { GameSettingsType } from '@/types/GameSettings';
import { TournamentSettingsType } from '@/types/TournamentSettings'
import { PersonFillUp, Controller, Toggle2On, Toggle2Off, LightningFill, ClockFill, Activity, TrophyFill, Alphabet, CircleFill } from 'react-bootstrap-icons'
import { BACKEND_URL } from '@/config';
import Link from 'next/link'
import { CustomTooltip } from '../Utils/Tooltip';
import { useRouter } from 'next/navigation'
import './styles.css'

interface Tournament {
	id: number;
	name: string,
	points_to_win: number,
	game_difficulty: number,
	power_ups: boolean,
	maxPlayerNumber: number;
	timer: number;
	isStarted: boolean;
}

interface GameSettingsProps {
	setGameSettings: Function,
	setToastShow: Function,
	setErrorField: Function,
	errorField: {
		joinError: string,
		nameMissing: string,
		difficultyMissing: string,
	},
	tournamentForm: GameSettingsType
}

export default function Tournament({ setToastShow, setErrorField, errorField }: GameSettingsProps) {
	const { session } = useAuth()
	const router = useRouter()

	const [tournamentData, setTournamentData] = useState<Tournament[] | null>([])
	const [modalShow, setModalShow] = useState(false);
	const [tournamentForm, setTournamentForm] = useState<TournamentSettingsType>({
		name: '',
		maxPlayerNumber: 4,
		timer: 15,
		pointsPerGame: 10,
		difficultyLevel: 4,
		power_ups: true,
	})


	const handleJoin = async (tournament: Tournament, userId: number, linkToJoin: string) => {
		if(tournament.isStarted) {
			setErrorField({ ...errorField, joinError: 'Tournament has already started' })
			setToastShow(true)
			return
		}
		try {
			await joinTournament(tournament.id, userId)
			router.push(`/tournaments/${linkToJoin}`)
		}
		catch (error: any) {
			setErrorField({ ...errorField, joinError: error.message })
			setToastShow(true)
		}
	}

	const submitTournament = async () => {
		if(tournamentForm.name.trim() === '') {
			setErrorField({ ...errorField, nameMissing: 'Tournament Name is Required' })
			return
		}
		if(tournamentForm.difficultyLevel === 0) {
			setErrorField({ ...errorField, difficultyMissing: 'Select a difficulty' })
			return
		}
		const payload = {
			'name': tournamentForm.name,
			'maxPlayerNumber': tournamentForm.maxPlayerNumber,
			'timer': 10,
			'difficultyLevel': tournamentForm.difficultyLevel,
			'pointsPerGame': tournamentForm.pointsPerGame,
			'power_ups': tournamentForm.power_ups,
			'creator': session.user.id
		}
		await CreateTournament(payload)
		setModalShow(false)
		setErrorField({ ...errorField, nameMissing: '', difficultyMissing: '' })
		setTournamentForm({...tournamentForm, name: ''})
		fetchData()
	}

	const fetchData = async () => {
		try {
			const tournaments = await GetTournamentData()
			setTournamentData(tournaments)
		} catch (error) {
			console.error('Error :', error)
		}
	}

	useEffect(() => {
		fetchData()
	}, [])


	return (
		<>
					<div className='d-flex flex-row align-items-center justify-content-between p-4'>
						<h3 className='mb-0 me-4'>Tournament Lobbies</h3>
						<Button className="btn btn-outline-light me-md-2" type='button' onClick={() => setModalShow(true)}>Create</Button>
					</div>
					<div className='d-flex flex-row align-items-center justify-content-around fw-bold border'>
						<div className="border-end col-2 d-flex justify-content-center align-items-center">
							<CustomTooltip text="Tournament Name" position="top">
								<Alphabet size={24}/>
							</CustomTooltip>
						</div >
						<div className="border-end col-3 d-flex justify-content-center align-items-center" >
							<CustomTooltip text="Created by" position="top">
								<PersonFillUp size={15}/>
							</CustomTooltip>
						</div>
						<div className="border-end col-1 d-flex justify-content-center align-items-center" >
						<CustomTooltip text="Players in Lobby" position="top">
							<Controller size={15} />
						</CustomTooltip>
						</div>
						<div className="border-end col-1 d-flex justify-content-center align-items-center">
							<CustomTooltip text="Points Per Game" position="top">
								<TrophyFill size={15}/>
							</CustomTooltip>
						</div>
						<div className="border-end col-1 d-flex justify-content-center align-items-center">
							<CustomTooltip text="Difficulty Level" position="top">
								<Activity size={15}/>
							</CustomTooltip>
						</div>
						<div className="border-end col-1 d-flex justify-content-center align-items-center">
							<CustomTooltip text="Power Ups" position="top">
								<LightningFill className="me-1" size={15} />
							</CustomTooltip>
						</div>
						<div className="border-end col-1 d-flex justify-content-center align-items-center">
							<CustomTooltip text="Duration" position="top">
								<ClockFill size={15} />
							</CustomTooltip>
						</div>
						<div className="col-1 d-flex justify-content-center align-items-center">
							<CustomTooltip text="Availability" position="top">
								<CircleFill size={15} />
							</CustomTooltip>
						</div>
					</div>
					<div className="mt-2 border scrollbar overflow-y-auto" style={{height: '550px'}}>
						{
							tournamentData && tournamentData.length === 0 && <h2 className="text-center mt-5 pt-5">No Tournaments Available</h2>
						}
							{
								tournamentData && tournamentData.map((tournament: TournamentSettingsType, index: number) => {
									return (
										<div 
											type="button" 
											key={index} 
											onClick={() => handleJoin(tournament, session.user.id, tournament.linkToJoin)} 
											className={`${tournamentData.length - 1 === index ? 'border-bottom' : ''} ${index === 0 ?  '' : 'border-top'} tournament-entry d-flex flex-row align-items-center justify-content-around fw-bold fs-5`}
										>
											<div className="border-end col-2 d-flex justify-content-center align-items-center text-truncate">
												{tournament.name}
											</div>
											<div className="border-end col-3 d-flex justify-content-center align-items-center text-truncate">
												<div className="d-flex flex-row align-items-center">
													<span className="me-2 text-truncate" style={{ maxWidth: 'calc(60%)' }}>{tournament.creator.username}</span>
														< div className="ms-2 position-relative border border-2 border-dark-subtle rounded-circle" style={{ width: '45px', height: '45px', overflow: 'hidden' }}>
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
												</div>
											</div>
											<div className="border-end col-1 d-flex justify-content-center align-items-center">
												<span className="fw-bold">{tournament.numberOfPlayers} / {tournament.maxPlayerNumber}</span>
											</div>
											<div className="border-end col-1 d-flex justify-content-center align-items-center">
												<span className="fw-bold">{tournament.pointsPerGame}</span>
											</div>
											<div className="border-end col-1 d-flex justify-content-center align-items-center">
												<span className="fw-bold">{tournament.difficultyLevel}</span>
											</div>
											<div className="border-end col-1 d-flex justify-content-center align-items-center">
												<span>
													{
														tournament.power_ups ? (<Toggle2On size={20} color={'green'} />) : (<Toggle2Off size={20} color={'red'} />)
													}
												</span>
											</div>
											<div className="col-1 border-end d-flex justify-content-center align-items-center">
													<span className="ms-1">{tournament.timer}'</span>
											</div>
											<div className="col-1 d-flex justify-content-center align-items-center">
												{
													tournament.isStarted ? ( <CircleFill size={20} color={'red'}/> ) : ( <CircleFill size={20} color={'green'}/> )
												}
											</div>
										</div>
									)
								})
							}


				<Modal
					show={modalShow}
					onHide={() => setModalShow(false)}
					size="lg"
					aria-labelledby="contained-modal-title-vcenter"
					centered
				>
					<Modal.Header closeButton>
						<Modal.Title>
							Select Tournament Parameters
						</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<form>
							<div className="form-floating mb-5">
								<input required type="text" className="form-control form-control-sm" id="floatingName" placeholder="Tournament Name" value={tournamentForm.name} onChange={(e) => setTournamentForm({ ...tournamentForm, name: (DOMPurify.sanitize(e.target.value)) })} />
								<label For="floatingName">Tournament Name
									<span className="text-danger">*</span>
								</label>
								<div className="text-danger">{errorField.nameMissing}</div>
							</div>
							<div className="text-center mb-3">
								<label className="form-label" For="playerRange">Max Number of Players</label>
								<p className="form-label text-primary">{tournamentForm.maxPlayerNumber}</p>
								<input
									type="range"
									className="form-range"
									min="3"
									max="8"
									step="1"
									id="playerRange"
									value={tournamentForm.maxPlayerNumber}
									onChange={(e) => setTournamentForm({ ...tournamentForm, maxPlayerNumber: parseInt(e.target.value) })}
								/>
							</div>
							<div className="text-center mb-3">
								<label className="form-label" For="pointsRange">Points Per Game</label>
								<p className="form-label text-primary">{tournamentForm.pointsPerGame}</p>
								<input
									type="range"
									className="form-range"
									min="1"
									max="21"
									step="1"
									id="pointsRange"
									value={tournamentForm.pointsPerGame}
									onChange={(e) => setTournamentForm({ ...tournamentForm, pointsPerGame: parseInt(e.target.value) })}
								/>
							</div>
							<div className="text-center">
								<label className="form-label">Timer (in minutes)
									<ClockFill className="ms-2" size={15} />
								</label>
								<p className="form-label text-primary">{tournamentForm.timer}</p>
								<input
									type="range"
									className="form-range"
									min="3"
									max="30"
									step="3"
									id="pointsRange"
									value={tournamentForm.timer}
									onChange={(e) => setTournamentForm({ ...tournamentForm, timer: parseInt(e.target.value) })}
								/>
							</div>
							<div className="mb-3">
								<label className="form-label">Difficulty Level
									<Activity className="ms-2" size={15} />
								</label>
								<select
									className="form-select"
									aria-label="Game Difficulty"
									id="difficultyLevel"
									value={tournamentForm.difficultyLevel}
									onChange={(e) =>
										setTournamentForm({ ...tournamentForm, difficultyLevel: parseInt(e.target.value) })
									}
								>
									<option value={0}>Select Game Difficulty</option>
									<option value={1}>Granny</option>
									<option value={2}>Boring</option>
									<option value={3}>Still Slow</option>
									<option selected value={4}>Kinda OK</option>
									<option value={5}>Now We are Talking</option>
									<option value={6}>Madman</option>
									<option value={7}>Legend</option>
								</select>
								<label className="text-danger form-label" For="difficultyLevel">{errorField.difficultyMissing}</label>
							</div>
								<div className="mb-1 form-check form-switch">
									<input
										className="form-check-input"
										type="checkbox"
										role="switch"
										id="flexSwitchCheckChecked"
										checked={tournamentForm.power_ups}
										onChange={(e) => setTournamentForm({ ...tournamentForm, power_ups: e.target.checked })}
									/>
									<label className="form-check-label">Power ups
										<LightningFill className="ms-1" size={15} />
									</label>
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