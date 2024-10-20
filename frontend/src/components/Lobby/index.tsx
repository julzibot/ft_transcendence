import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { AddLobbyData, GetLobbyData, joinLobby } from '@/services/onlineGames'
import { useAuth } from '@/app/lib/AuthContext';
import { useRouter } from 'next/navigation';
import DOMPurify from 'dompurify';
import { CustomTooltip } from '@/components/Utils/Tooltip';
import { Alphabet, PersonFillUp, TrophyFill, Activity, LightningFill, Toggle2Off, Toggle2On } from 'react-bootstrap-icons';
import "./styles.css";
import { BACKEND_URL } from '@/config';
import DifficultyLevel from '../Utils/DifficultyLevel';

interface LobbyProps {
	setToastShow: Function,
	setErrorField: Function,
	errorField: {
		joinError: string,
		nameMissing: string,
		difficultyMissing: string,
	},
}

interface User {
	id: number,
	username: string,
	image: string,
}

interface Lobby {
	id: number,
	name: string,
	difficultyLevel: number,
	lobbyWinner: User,
	pointsPerGame: number,
	power_ups: boolean,
	player1: User,
	player2: User,
	isFull: boolean,
	isStarted: boolean,
	linkToJoin: string,
}

export default function Lobby({ setToastShow, setErrorField, errorField }: LobbyProps) {
	const { session } = useAuth()
	const router = useRouter()

	const [lobbyData, setLobbyData] = useState<Lobby[]>([])
	const [modalShow, setModalShow] = useState(false);
	const [lobbyForm, setLobbyForm] = useState({
		name: '',
		pointsPerGame: 10,
		difficultyLevel: 0,
		power_ups: false,
	})

	const handleJoin = async (lobby: any, linkToJoin: string) => {
		try {
			await joinLobby(lobby.id, session?.user?.id)
			router.push(`/game/online/lobby/${linkToJoin}`)
		}
		catch (error: any) {
			setErrorField({ ...errorField, joinError: error.message })
			setToastShow(true)
		}
	}


	const handleSubmitData = async () => {
		if (lobbyForm.name.trim() === '') {
			setErrorField({ ...errorField, nameMissing: 'Lobby Name is Required' })
			return
		}
		if (lobbyForm.difficultyLevel === 0) {
			setErrorField({ ...errorField, difficultyMissing: 'Select a difficulty' })
			return
		}
		const payload = {
			'name': lobbyForm.name,
			'difficultyLevel': lobbyForm.difficultyLevel,
			'pointsPerGame': lobbyForm.pointsPerGame,
			'power_ups': lobbyForm.power_ups,
			'player1': session?.user?.id
		}
		const linkToJoin = await AddLobbyData(payload)
		router.push(`/game/online/lobby/${linkToJoin}`)
	}

	const fetchLobbyData = async () => {
		try {
			const lobbies = await GetLobbyData()
			console.log(lobbies[0])
			setLobbyData([...lobbies].sort((a, b) => {
				return (a.isStarted === b.isStarted) ? 0 : ((a.isStarted ? 1 : -1))
			}))
		} catch (error) {
			console.error('Error :', error)
		}
	}

	useEffect(() => {
		fetchLobbyData()
	}, [])


	return (
		<>
			<div className='d-flex flex-row align-items-center justify-content-between p-4'>
				<h3 className='mb-0 me-4'> Game Lobbies</h3>
				<Button className="btn btn-outline-light" type='button' onClick={() => setModalShow(true)}>Create</Button>
			</div>
			<div className='d-flex flex-row align-items-center justify-content-evenly fw-bold border'>
				<div className="border-end col d-flex justify-content-center align-items-center">
					<CustomTooltip text="Tournament Name" position="top">
						<Alphabet size={24} />
					</CustomTooltip>
				</div >
				<div className="border-end col d-flex justify-content-center align-items-center" >
					<CustomTooltip text="Created by" position="top">
						<PersonFillUp size={15} />
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
				<div className="col-1 d-flex justify-content-center align-items-center">
					<CustomTooltip text="Power Ups" position="top">
						<LightningFill className="me-1" size={15} />
					</CustomTooltip>
				</div>
			</div>
			<div className="mt-2 border scrollbar overflow-y-auto" style={{ height: '550px' }}>
				{
					lobbyData && lobbyData.length === 0 && <h2 className="text-center mt-5 pt-5">No Games Available</h2>
				}
				{
					lobbyData && lobbyData.map((lobby: any, index: number) => {
						return (
							<div
								key={index}
								onClick={() => handleJoin(lobby, lobby.linkToJoin)}
								className={`${lobby.isFull ? 'disabled' : ''} ${lobbyData.length - 1 === index ? 'border-bottom' : ''} ${index === 0 ? '' : 'border-top'} lobby-entry d-flex flex-row align-items-center justify-content-evenly fw-bold fs-5`}
							>
								<div className="border-end col d-flex justify-content-center align-items-center text-truncate">
									{lobby.name}
								</div>
								<div className="border-end col d-flex justify-content-center align-items-center text-truncate">
									<div className="d-flex flex-row align-items-center">
										<span className="me-2 text-truncate" style={{ maxWidth: 'calc(60%)' }}>{lobby.player1.username}</span>
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
												src={`${BACKEND_URL}${lobby.player1.image}`}
											/>
										</div>
									</div>
								</div>
								<div className="border-end col-1 d-flex justify-content-center align-items-center">
									<span className="fw-bold">{lobby.pointsPerGame}</span>
								</div>
								<div className="border-end col-1 d-flex justify-content-center align-items-center">
									{DifficultyLevel(lobby.difficultyLevel)}
								</div>
								<div className="col-1 d-flex justify-content-center align-items-center">
									<span>
										{
											lobby.power_ups ? (<Toggle2On size={20} color={'green'} />) : (<Toggle2Off size={20} color={'red'} />)
										}
									</span>
								</div>
							</div>
						)
					})
				}
			</div>

			<Modal
				show={modalShow}
				onHide={() => setModalShow(false)}
				size="lg"
				aria-labelledby="contained-modal-title-vcenter"
				centered
			>
				<Modal.Header closeButton>
					<Modal.Title id="contained-modal-title-vcenter">
						Select Game Settings
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<form autoComplete='off'>
						<div className="form-floating mb-5">
							<input required type="text" className="form-control form-control-sm" id="floatingName" placeholder="Lobby Name" value={lobbyForm.name} onChange={(e) => setLobbyForm({ ...lobbyForm, name: (DOMPurify.sanitize(e.target.value)) })} />
							<label htmlFor="floatingName">Lobby Name
								<span className="text-danger">*</span>
							</label>
							<div className="text-danger">{errorField.nameMissing}</div>
						</div>
						<div className="text-center mb-3">
							<label className="form-label" htmlFor="pointsRange">Points Per Game</label>
							<p className="form-label text-primary">{lobbyForm.pointsPerGame}</p>
							<input
								type="range"
								className="form-range"
								min="1"
								max="21"
								step="1"
								id="pointsRange"
								value={lobbyForm.pointsPerGame}
								onChange={(e) => setLobbyForm({ ...lobbyForm, pointsPerGame: parseInt(e.target.value) })}
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
								value={lobbyForm.difficultyLevel}
								onChange={(e) =>
									setLobbyForm({ ...lobbyForm, difficultyLevel: parseInt(e.target.value) })
								}
							>
								<option value={0}>Select Game Difficulty</option>
								<option value={1}>Granny</option>
								<option value={2}>Boring</option>
								<option value={3}>Still Slow</option>
								<option value={4}>Kinda OK</option>
								<option value={5}>Now We are Talking</option>
								<option value={6}>Madman</option>
								<option value={7}>Legend</option>
							</select>
							<label className="text-danger form-label" htmlFor="difficultyLevel">{errorField.difficultyMissing}</label>
						</div>
						<div className="mb-1 form-check form-switch">
							<input
								className="form-check-input"
								type="checkbox"
								role="switch"
								id="flexSwitchCheckChecked"
								checked={lobbyForm.power_ups}
								onChange={(e) => setLobbyForm({ ...lobbyForm, power_ups: e.target.checked })}
							/>
							<label className="form-check-label">Power ups
								<LightningFill className="ms-1" size={15} />
							</label>
						</div>
					</form>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setModalShow(false)}>Close</Button>
					<Button variant="primary" onClick={() => handleSubmitData()}>Add</Button>
				</Modal.Footer>
			</Modal>
		</>
	)
}
