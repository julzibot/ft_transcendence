import React, { useEffect, useState } from 'react'
import "bootstrap/dist/css/bootstrap.min.css"
import { Button, Modal } from 'react-bootstrap'
import { GetLobbyData, AddLobbyData, HandlePutLobby } from '@/services/tournaments';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { GameSettings } from '@/types/GameSettings';

interface MatchParameters {
	user: number,
	points_to_win: number,
	game_difficulty: number,
	power_ups: boolean
}
interface GameSettingsProps {
	setMatchParameters: Function,
	matchParameters: MatchParameters,
	gameSettings: GameSettings
}

export default function Lobby({ setMatchParameters, matchParameters, gameSettings }: GameSettingsProps) {
	const { data: session } = useSession()
	const router = useRouter()
	const [lobbyData, setLobbyData] = useState([])
	const [modalShow, setModalShow] = useState(false);
	const [errorfield, setErrorfield] = useState({
		name: '',
	})
	const [errshow, setErrShow] = useState(false)
	const [lobbyForm, setLobbyForm] = useState({
		name: '',
		numberOfPlayer: '2',
		isActiveLobby: false,
	})
	const handleShow = () => {
		setLobbyForm({
			name: '',
			numberOfPlayer: '',
			isActiveLobby: false,
		})
		setErrorfield(
			{
				name: '',
			}
		)
		setModalShow(true)
	}

	const handleFormData = (e: React.ChangeEvent<HTMLInputElement>, key) => {
		setLobbyForm(
			{
				...lobbyForm,
				[key]: (key === "isActiveLobby" || key === "powerUps") ? (e.target.checked) : (e.target.value)
			}
		)
	}

	const handleSubmitData = async () => {
		let errors = {};

		if (lobbyForm?.name === '') {
			errors.name = 'Name field Required';
		}

		if (Object.keys(errors).length > 0) {
			// There are errors, set them and show error message
			setErrorfield(errors);
			setErrShow(true);
		} else {
			setErrShow(false);

			const payload = {
				"name": lobbyForm?.name,
				"user_id": session?.user?.id
			}
			try {
				const data = await AddLobbyData(payload);
				setModalShow(false);
				fetchLobbyData();

				localStorage.setItem('gameSettings', JSON.stringify(gameSettings));

				router.push(`/game/online/lobby/${data?.lobby?.linkToJoin}`);
			} catch (error) {
				console.error('Error:', error);
				// Handle error from API call
			}
		}
	};

	const handlePutLobbyApi = async (element) => {
		const payload = {
			"lobby_id": element?.id.toString(),
			"user_id": session?.user?.id.toString()
		}
		const response = await HandlePutLobby(payload)
		if (response) {
			fetchLobbyData()
		}
	}
	const handleUser = async (item) => {
		if ((item?.player1 && item?.player1 !== session?.user?.id) && item?.player2 === null) {
			handlePutLobbyApi(item);
			localStorage.setItem('gameSettings', JSON.stringify(gameSettings));

			router.push(`/game/online/lobby/${item?.linkToJoin}?`)
		} else {
			alert('Waiting For Other Player to join')
		}
	}

	const fetchLobbyData = async () => {
		try {
			const lobbydata = await GetLobbyData()
			if (lobbydata) {
				setLobbyData(lobbydata)
			}
		} catch (error) {
			console.error('Error :', error)
		}
	}

	useEffect(() => {
		fetchLobbyData()
	}, [])

	return (
		<div className='d-flex justify-content-center'>
			<div className='w-100 border rounded p-4' style={{ maxWidth: '800px' }}>
				<div className='d-flex align-items-center justify-content-between border-bottom pb-3'>
					<h3 className='mb-0 me-4'>Lobby</h3>
					<Button className="btn btn-outline-light me-md-2" type='button' onClick={handleShow}>Create</Button>
				</div>
				<div className='w-100 pt-2' >
					<div className='d-flex flex-column'>
						{
							lobbyData.length > 0 && lobbyData?.map((item: any, i: number) => {
								return (
									<h6 style={{ cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }} className='d-flex align-items-center justify-content-between fw-medium py-2 w-auto text-primary' key={item.id}>
										<span>{i + 1}. {item.name}</span>
										{
											item?.player1 && item?.player1 !== session?.user?.id && <button className='btn btn-warning' onClick={() => handleUser(item)}>Join</button>
										}
									</h6>
								)
							})
						}
					</div>
				</div>
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
						Select Game Customizations
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<form>
						<div className="mb-3">
							<label className="form-label">Name</label>
							<span className='text-danger'>*</span>
							<input type="text" className="form-control" value={lobbyForm.name} onChange={(e) => handleFormData(e, 'name')} />
							{errorfield && lobbyForm.name === '' ? <div className="form-text text-danger">{errorfield.name}</div> : null}
						</div>
						<div className="mb-3 align-items-center text-center">
							<label className="form-label">Points Per Game
								<span className='text-danger'>*</span>
							</label>
							<div className='text-primary m-2 d-flex text-center align-items-center justify-content-center'>
								{gameSettings.pointsToWin}
							</div>
							<input
								type="range"
								className="form-range"
								min="1"
								max="21"
								step="1"
								id="pointsRange"
								value={gameSettings.pointsToWin}
								onChange={(e) => setGameSettings({ ...gameSettings, pointsToWin: parseInt(e.target.value) })}
							/>
						</div>
						<div className="mb-3">
							<label className="form-label">Difficulty Level*</label>
							<select
								className="form-select"
								aria-label="Game Difficulty"
								value={gameSettings.gameDifficulty}
								onChange={(e) =>
									setGameSettings({ ...gameSettings, gameDifficulty: parseInt(e.target.value) })
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
									checked={gameSettings.powerUps}
									onChange={() =>
										setGameSettings({ ...gameSettings, powerUps: !gameSettings.powerUps })
									}
								/>
								<label className="form-check-label">Power ups</label>
							</div>
						</div>
					</form>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setModalShow(false)}>Close</Button>
					<Button variant="primary" onClick={handleSubmitData}>Add</Button>
				</Modal.Footer>
			</Modal>
		</div>
	)
}
