'use client'

import React, { useEffect, useState } from 'react'
import "bootstrap/dist/css/bootstrap.min.css"
import { Button, Modal } from 'react-bootstrap'
import { useParams, useRouter } from "next/navigation";
import { useAuth } from '@/app/lib/AuthContext';
import { ArrowUpRightSquare } from 'react-bootstrap-icons';
import { AddTournamentData, GetTournamentData } from '@/services/tournaments';
import DOMPurify from 'dompurify';
import { GameSettingsProps } from '@/types/GameSettings';
import './styles.css'

const gameLevel = [
	{ value: 0, level: 'Beginner' },
	{ value: 1, level: 'Intermediate' },
	{ value: 2, level: 'Expert' }
]

export default function Tournament({ setGameSettings, gameSettings }: GameSettingsProps) {
	const { session } = useAuth()
	const router = useRouter();
	const params = useParams()
	const [modalShow, setModalShow] = useState(false);
	const [tournamentData, setTournamentData] = useState([])
	const [selectedTournament, setSelectedTournament] = useState()
	const [tounamentForm, setTounamentForm] = useState({
		name: '',
		gamePoint: 0,
		gameLevel: '',
		power_ups: false
	})

	const [errField, setErrFields] = useState({
		name: '',
		gamePoint: '',
		gameLevel: '',
		isPrivate: '',
	})

	const handleShow = () => {
		setTounamentForm({
			name: '',
			gamePoint: 0,
			gameLevel: '',
			power_ups: false
		})
		setErrFields({
			name: '',
			gamePoint: '',
			gameLevel: '',
			isPrivate: '',
		})
		setModalShow(true)
	}

	const [errshow, setErrShow] = useState(false)

	const handleClose = () => {
		setModalShow(false)
	}

	const isNumber = (event) => {
		const charCode = (event.which) ? event.which : event.keyCode
		if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
			event.preventDefault()
		} else {
			return true;
		}
	}

	const fetchTournamentData = async () => {
		try {
			const tournamentdata = await GetTournamentData(gameName)
			setTournamentData(tournamentdata?.data?.tournaments)
		} catch (error) {
			console.error('Error :', error)
		}
	}

	const handleSelectedData = (item: object) => {
		setSelectedTournament(item?.id)
		router.push(`/tournaments/${item?.id}`)
	}


	const handleFormData = (e, key) => {
		setTounamentForm({
			...tounamentForm,
			[key]: (key === 'isActiveTournament' || key === 'isPrivate' || key === 'power_ups') ? e.target.checked : DOMPurify.sanitize(e.target.value)
		})
	}

	const handleSubmitData = async () => {
		let errors = {};

		if (tounamentForm?.name === '') {
			errors.name = 'Name field Required';
		}
		if (tounamentForm?.numberOfPlayer === '') {
			errors.numberOfPlayer = 'Add Number of player';
		}
		if (tounamentForm?.gamePoint === '') {
			errors.gamePoint = 'Add Game point';
		} else if (tounamentForm?.gamePoint === 0) {
			errors.gamePoint = 'Game point should be greater than 0';
		}
		if (tounamentForm?.gameLevel === '') {
			errors.gameLevel = 'Add Game level';
		}

		if (Object.keys(errors).length > 0) {
			// There are errors, set them and show error message
			setErrFields(errors);
			setErrShow(true);
		} else {
			// No errors, proceed with form submission
			setErrShow(false);

			const payload = {
				"name": tounamentForm?.name,
				"numberOfPlayers": tounamentForm?.numberOfPlayer,
				"isPrivate": tounamentForm?.isPrivate,
				"difficultyLevel": tounamentForm?.gameLevel,
				"isActiveTournament": tounamentForm?.isActiveTournament,
				"pointsPerGame": tounamentForm?.gamePoint,
				"timer": Number(tounamentForm?.timer),
				"gameName": gameName,
				"power_ups": tounamentForm?.power_ups,
			};

			try {
				await AddTournamentData(payload);
				handleClose();
				fetchTournamentData();
			} catch (error) {
				console.error('Error:', error);
				// Handle error from API call
			}
		}
	};

	useEffect(() => {
		// localStorage.setItem('GameName', JSON.stringify(null))
		fetchTournamentData()
	}, [])
	return (
		<div className='d-flex justify-content-center'>
			<div className='w-100 border rounded p-4' style={{ maxWidth: '800px' }}>
				<div className='d-flex align-items-center justify-content-between border-bottom pb-3'>
					<h3 className='mb-0 me-4'>Tournaments</h3>
					<Button className="btn btn-outline-light me-md-2" type='button' onClick={handleShow}>Create</Button>
				</div>
				<div className='w-100 pt-2' >
					<div className='d-flex flex-column'>
						{
							tournamentData.length > 0 && tournamentData?.map((item: any, i: number) => {
								return (
									<h6 style={{ cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }} className='d-flex align-items-center justify-content-between fw-medium py-2 w-auto text-primary' key={item.id} onClick={() => handleSelectedData(item)}>
										<span>{i + 1}. {item.name}</span>
										<ArrowUpRightSquare className='h5' />
									</h6>
								)
							})
						}
					</div>
				</div>
			</div>


			<Modal
				show={modalShow}
				onHide={handleClose}
				size="lg"
				aria-labelledby="contained-modal-title-vcenter"
				centered
			>
				<Modal.Header closeButton>
					<Modal.Title id="contained-modal-title-vcenter">
						Add Tournament details
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<form>

						<div className="mb-3">
							<label className="form-label">Name</label>
							<span className='text-danger'>*</span>
							<input
								type="text"
								className="form-control"
								value={tounamentForm.name}
								onChange={(e) => handleFormData(e, 'name')} />
							{errField && tounamentForm?.name === '' ? <div className="form-text text-danger">{errField.name}</div> : ''}
						</div>

						<div className="mb-3 align-items-center text-center">
							<label className="form-label">Points Per Game
								<span className='text-danger'>*</span>
							</label>
							<div className='text-primary m-2 d-flex text-center align-items-center justify-content-center'>
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

						<div className="mb-3">
							<label className="form-label">Difficulty Level
								<span className='text-danger'>*</span>
							</label>
							<select
								className="form-select select-text"
								id="select-text"
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
									onChange={() =>
										setGameSettings({ ...gameSettings, power_ups: !gameSettings.power_ups })
									}
								/>
								<label className="form-check-label">Power ups</label>
							</div>
						</div>

					</form>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleClose}>Close</Button>
					<Button variant="primary" onClick={handleSubmitData}>Add</Button>
				</Modal.Footer>
			</Modal>


		</div>
	);
}