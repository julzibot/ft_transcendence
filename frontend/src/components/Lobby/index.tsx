import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { AddLobbyData, GetLobbyData, JoinLobby } from '@/services/onlineGames'
import { useAuth } from '@/app/lib/AuthContext';
import { useRouter } from 'next/navigation';
import DOMPurify from 'dompurify';
import { Alphabet, PersonFillUp, TrophyFill, Activity, LightningFill, Toggle2Off, Toggle2On } from 'react-bootstrap-icons';
import { CustomTooltip } from '../Utils/Tooltip';
import "./styles.css";
import DifficultyLevel from '../Utils/DifficultyLevel';
import Image from '../Utils/Image';

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
	creator: User,
	gameMode: 'TOURNAMENT' | 'ONLINE'
}

export default function Lobby({ setToastShow, setErrorField, errorField }: LobbyProps) {
	const { session } = useAuth()
	const router = useRouter()

	const [lobbyData, setLobbyData] = useState<Lobby[]>([])
	const [modalShow, setModalShow] = useState(false);
	const [lobbyForm, setLobbyForm] = useState({
		name: '',
		pointsPerGame: 10,
		difficultyLevel: "",
		power_ups: false,
	})

	const handleJoin = async (linkToJoin: string) => {
		try {
			await JoinLobby(linkToJoin, session?.user?.id)
			router.replace(`/game/online/lobby/${linkToJoin}`)
		}
		catch (error: any) {
			setErrorField({ ...errorField, joinError: error.message })
			setToastShow(true)
		}
	}


	const handleSubmitData = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const payload = {
			'name': lobbyForm.name,
			'difficultyLevel': Number(lobbyForm.difficultyLevel),
			'pointsPerGame': lobbyForm.pointsPerGame,
			'power_ups': lobbyForm.power_ups,
			'player1': session?.user?.id
		}
		const linkToJoin = await AddLobbyData(payload)
		router.replace(`/game/online/lobby/${linkToJoin}`)
	}

	const fetchLobbyData = async () => {
		try {
			const lobbies = await GetLobbyData()
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
				{
					lobbyData && (lobbyData.length === 0 || lobbyData[0].gameMode === 'TOURNAMENT') ?
						<Button className="btn btn-warning border-secondary border-3" type='button' onClick={() => setModalShow(true)}>Create</Button> :
						<Button className="btn btn-outline-light" type='button' onClick={() => setModalShow(true)}>Create</Button>
				}
			</div>
			<div className='d-flex flex-row align-items-center justify-content-evenly fw-bold border'>
				<div className="border-end col d-flex justify-content-center align-items-center">
					<CustomTooltip text="Game Name" position="top">
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
			<div className="mt-2 border scrollbar overflow-y-auto position-relative" style={{ height: '500px' }}>
				{
					lobbyData && (lobbyData.length === 0 || lobbyData[0].gameMode === 'TOURNAMENT') && <h2 className="text-center position-absolute translate-middle start-50 top-50">No Games Available</h2>
				}
				{
					lobbyData && lobbyData.map((lobby: Lobby, index: number) => (lobby.gameMode === 'ONLINE' &&
						<>
							< div
								key={index}
								onClick={() => handleJoin(lobby.linkToJoin, lobby.linkToJoin)}
								className={`${lobby.isFull ? 'disabled' : ''} ${lobbyData.length - 1 === index ? 'border-bottom' : ''} ${index === 0 ? '' : 'border-top'} lobby-entry d-flex flex-row align-items-center justify-content-evenly fw-bold fs-5`}
							>
								<div className="border-end col d-flex justify-content-center align-items-center text-truncate">
									{lobby.name}
								</div>
								<div className="border-end col d-flex justify-content-center align-items-center text-truncate">
									<div className="d-flex flex-row align-items-center">
										<Image src={lobby.creator.image} alt="profile picture" whRatio="30px" />
										<span className="ms-2 text-truncate" style={{ maxWidth: 'calc(100%)' }}>{lobby.creator.username}</span>
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
						</>)
					)
				}
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
						Select Game Settings
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<form autoComplete='off' onSubmit={handleSubmitData}>
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
								required
								className="form-select"
								aria-label="Game Difficulty"
								id="difficultyLevel"
								value={lobbyForm.difficultyLevel}
								onChange={(e) =>
									setLobbyForm({ ...lobbyForm, difficultyLevel: e.target.value })
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
						<div className="mb-4 form-check form-switch">
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
						<div className="d-flex justify-content-end">
							<Button variant="secondary" onClick={() => setModalShow(false)}>Close</Button>
							<Button variant="primary" type="submit">Enter</Button>
						</div>
					</form>
				</Modal.Body>
			</Modal>
		</>
	)
}
