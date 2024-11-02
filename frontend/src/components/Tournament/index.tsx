'use client'

import React, { useEffect, useState, FormEvent } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { GetTournamentData, CreateTournament, joinTournament } from '@/services/tournaments';
import { useAuth } from '@/app/lib/AuthContext';
import DOMPurify from 'dompurify';
import { PersonFillUp, Controller, Toggle2On, Toggle2Off, LightningFill, ClockFill, Activity, TrophyFill, Alphabet, CircleFill } from 'react-bootstrap-icons'
import { CustomTooltip } from '../Utils/Tooltip';
import { useRouter } from 'next/navigation'
import './styles.css'
import DifficultyLevel from '../Utils/DifficultyLevel';
import Image from '../Utils/Image';
import { ParticipantType } from '@/types/TournamentSettings';

interface User {
	id: number;
	username: string;
	image: string;
};

interface Tournament {
	id: number;
	name: string,
	points_to_win: number,
	game_difficulty: number,
	power_ups: boolean,
	maxPlayerNumber: number;
	timer: number;
	isStarted: boolean;
	linkToJoin: string;
	creator: User
	numberOfPlayers: number;
	pointsPerGame: number;
	difficultyLevel: number;
	participants: ParticipantType[]
}

interface TournamentSettingsProps {
	setToastShow: Function,
	setErrorField: Function,
	errorField: {
		joinError: string,
		nameMissing: string,
		difficultyMissing: string,
	},
}

export default function Tournament({ setToastShow, setErrorField, errorField }: TournamentSettingsProps) {
	const { session } = useAuth()
	const router = useRouter()

	const [tournamentData, setTournamentData] = useState<Tournament[] | null>([])
	const [modalShow, setModalShow] = useState(false);
	const [tournamentForm, setTournamentForm] = useState({
		name: '',
		maxPlayerNumber: 4,
		timer: 15,
		pointsPerGame: 1,
		difficultyLevel: "",
		power_ups: true,
		isStarted: false,
		numberOfPlayers: 0,
		creator: null,
		linkToJoin: ''
	})


	const handleJoin = async (tournament: Tournament, userId: number | undefined, linkToJoin: string) => {
		try {
			await joinTournament(tournament.id, userId)
			router.push(`/tournaments/${linkToJoin}`)
		}
		catch (error: any) {
			setErrorField({ ...errorField, joinError: error.message })
			setToastShow(true)
		}
	}

	const submitTournament = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const payload = {
			'name': tournamentForm.name,
			'maxPlayerNumber': tournamentForm.maxPlayerNumber,
			'timer': tournamentForm.timer,
			'difficultyLevel': Number(tournamentForm.difficultyLevel),
			'pointsPerGame': tournamentForm.pointsPerGame,
			'power_ups': tournamentForm.power_ups,
			'creator': session?.user?.id
		}
		await CreateTournament(payload)
		setErrorField({ ...errorField, nameMissing: '', difficultyMissing: '' })
		setTournamentForm({ ...tournamentForm, name: '' })
		fetchData()
		setModalShow(false)
	}

	const fetchData = async () => {
		try {
			const tournaments = await GetTournamentData()
			setTournamentData([...tournaments].sort((a, b) => {
				return (a.isStarted === b.isStarted) ? 0 : ((a.isStarted ? 1 : -1))
			}))
		} catch (error) {
			console.error('Error :', error)
		}
	}

	useEffect(() => {
		fetchData()
	}, [])

	useEffect(() => {
		console.log(tournamentData)
	}, [tournamentData])


	return (
		<>
			<div className='d-flex flex-row align-items-center justify-content-between p-4'>
				<h3 className='mb-0 me-4'>Tournament Lobbies</h3>
				<Button className="btn btn-outline-light me-md-2" type='button' onClick={() => setModalShow(true)}>Create</Button>
			</div>
			<div className='d-flex flex-row align-items-center justify-content-around fw-bold border'>
				<div className="border-end col-2 d-flex justify-content-center align-items-center">
					<CustomTooltip text="Tournament Name" position="top">
						<Alphabet size={24} />
					</CustomTooltip>
				</div >
				<div className="border-end col-3 d-flex justify-content-center align-items-center" >
					<CustomTooltip text="Created by" position="top">
						<PersonFillUp size={15} />
					</CustomTooltip>
				</div>
				<div className="border-end col-1 d-flex justify-content-center align-items-center" >
					<CustomTooltip text="Players in Lobby" position="top">
						<Controller size={15} />
					</CustomTooltip>
				</div>
				<div className="border-end col-1 d-flex justify-content-center align-items-center">
					<CustomTooltip text="Points Per Game" position="top">
						<TrophyFill size={15} />
					</CustomTooltip>
				</div>
				<div className="border-end col-1 d-flex justify-content-center align-items-center">
					<CustomTooltip text="Difficulty Level" position="top">
						<Activity size={15} />
					</CustomTooltip>
				</div>
				<div className="border-end col-1 d-flex justify-content-center align-items-center">
					<CustomTooltip text="Power Ups" position="top">
						<LightningFill className="me-1" size={15} />
					</CustomTooltip>
				</div>
				<div className="col-1 d-flex justify-content-center align-items-center">
					<CustomTooltip text="Duration" position="top">
						<ClockFill size={15} />
					</CustomTooltip>
				</div>
			</div>
			<div className="mt-2 border scrollbar overflow-y-auto" style={{ height: '550px' }}>
				{
					tournamentData && tournamentData.length === 0 && <h2 className="text-center mt-5 pt-5">No Tournaments Available</h2>
				}
				{
					tournamentData && tournamentData.map((tournament: Tournament, index: number) => {
						return (
							<div
								key={index}
								onClick={() => handleJoin(tournament, session?.user?.id, tournament.linkToJoin)}
								className={`${tournament.isStarted && !tournament.participants.some((participant) => participant.user.id === session.user.id) ? 'disabled' : 'text-light'
									} ${tournamentData.length - 1 === index ? 'border-bottom' : ''} ${index === 0 ? '' : 'border-top'} tournament-entry d-flex flex-row align-items-center justify-content-around fw-bold fs-5 z-1 position-relative`}
							>
								{
									tournament.isStarted && tournament.participants.some((participant) => participant.user.id === session.user.id) &&
									<div className="video-container">
										<video
											className="background-video"
											autoPlay
											muted
											loop
											src="/videos/flame3.mp4"
										>
											Your browser does not support HTML5 video.
										</video>
									</div>
								}
								<div className="border-end col-2 d-flex justify-content-center align-items-center text-truncate">
									{tournament.name}
								</div>
								<div className="border-end col-3 d-flex justify-content-center align-items-center text-truncate">
									<div className="d-flex flex-row align-items-center">
										<Image src={tournament.creator.image} alt="profile picture" whRatio="45px" />
										<span className="ms-2 text-truncate" style={{ maxWidth: 'calc(70%)' }}>{tournament.creator.username}</span>
									</div>
								</div>
								<div className="border-end col-1 d-flex justify-content-center align-items-center">
									<span className="fw-bold">{tournament.numberOfPlayers} / {tournament.maxPlayerNumber}</span>
								</div>
								<div className="border-end col-1 d-flex justify-content-center align-items-center">
									<span className="fw-bold">{tournament.pointsPerGame}</span>
								</div>
								<div className="border-end col-1 d-flex justify-content-center align-items-center">
									{DifficultyLevel(tournament.difficultyLevel)}
								</div>
								<div className="border-end col-1 d-flex justify-content-center align-items-center">
									<span>
										{
											tournament.power_ups ? (<Toggle2On size={20} color={'green'} />) : (<Toggle2Off size={20} color={'red'} />)
										}
									</span>
								</div>
								<div className="col-1 d-flex justify-content-center align-items-center">
									<span className="ms-1">{tournament.timer}'</span>
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
						<form autoComplete='off' onSubmit={submitTournament}>
							<div className="form-floating mb-5">
								<input required type="text" className="form-control form-control-sm" id="floatingName" placeholder="Tournament Name" value={tournamentForm.name} onChange={(e) => setTournamentForm({ ...tournamentForm, name: (DOMPurify.sanitize(e.target.value)) })} />
								<label htmlFor="floatingName">Tournament Name
									<span className="text-danger">*</span>
								</label>
								<div className="text-danger">{errorField.nameMissing}</div>
							</div>
							<div className="text-center mb-3">
								<label className="form-label" htmlFor="playerRange">Max Number of Players</label>
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
								<label className="form-label" htmlFor="pointsRange">Points Per Game</label>
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
									min="1"
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
									required
									aria-label="Game Difficulty"
									id="difficultyLevel"
									value={tournamentForm.difficultyLevel}
									onChange={(e) =>
										setTournamentForm({ ...tournamentForm, difficultyLevel: e.target.value })
									}
								>
									<option value={""} disabled>
										Select Game Difficulty
									</option>
									<option value={"1"}>Granny</option>
									<option value={"2"}>Boring</option>
									<option value={"3"}>Still Slow</option>
									<option value={"4"}>Kinda OK</option>
									<option value={"5"}>Now We are Talking</option>
									<option value={"6"}>Madman</option>
									<option value={"7"}>Legend</option>
								</select>
								<label className="text-danger form-label" htmlFor="difficultyLevel">{errorField.difficultyMissing}</label>
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
							<div className="d-flex justify-content-end">
								<Button variant="secondary" onClick={() => setModalShow(false)}>Close</Button>
								<Button variant="primary" type="submit">Enter</Button>
							</div>
						</form>
					</Modal.Body>
				</Modal>

			</div >

		</>
	)
}