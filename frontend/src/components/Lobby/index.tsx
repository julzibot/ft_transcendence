import React, { useEffect, useState } from 'react'
import "bootstrap/dist/css/bootstrap.min.css"
import { Button, Modal } from 'react-bootstrap'
import { ArrowUpRightSquare } from 'react-bootstrap-icons';
import { GetLobbyData, AddLobbyData, HandlePutLobby } from '@/services/tournaments';
import { getSession } from 'next-auth/react';

const gameLevel = [
	{ value: 0, level: 'Beginner' },
	{ value: 1, level: 'Intermediate' },
	{ value: 2, level: 'Expert' }
]
interface props {
	gameName?: string
}
const Lobby = ({ gameName }: props) => {
	const [session, setSession] = useState()
	const [lobbyData, setLobbyData] = useState([])
	const [modalShow, setModalShow] = useState(false);
	const [errorfield, setErrorfield] = useState({
		name: '',
		isPrivate: '',
		difficultyLevel: '',
		pointsPerGame: '',
	})
	const [errshow, setErrShow] = useState(false)
	const [lobbyForm, setLobbyForm] = useState({
		name: '',
		numberOfPlayer: '2',
		isPrivate: false,
		difficultyLevel: '',
		isActiveLobby: false,
		pointsPerGame: '0',
		timer: '0',
		gameName: '',
		powerUps: false
	})
	const handleShow = () => {
		setLobbyForm({
			name: '',
			numberOfPlayer: '',
			isPrivate: false,
			difficultyLevel: '',
			isActiveLobby: false,
			pointsPerGame: '0',
			timer: '0',
			gameName: '',
			powerUps: false
		})
		setErrorfield(
			{
				name: '',
				isPrivate: '',
				difficultyLevel: '',
				pointsPerGame: '',
			}
		)
		setModalShow(true)
	}

	const handleClose = () => {
		setModalShow(false)
	}

	const handleFormData = (e, key) => {
		setLobbyForm(
			{
				...lobbyForm,
				[key]: (key === "isActiveLobby" || key === "isPrivate" || key === "powerUps") ? (e.target.checked) : (e.target.value)
			}
		)
	}

	const isNumber = (event) => {
		const charCode = (event.which) ? event.which : event.keyCode
		if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
			event.preventDefault()
		} else {
			return true
		}
	}


	//   const handleSubmitData = async () => {
	// if (lobbyForm?.name === '' && lobbyForm?.pointsPerGame === '0' && lobbyForm?.difficultyLevel === '' && (lobbyForm?.timer === '0' || lobbyForm?.timer === '') && lobbyForm?.isPrivate === false && lobbyForm?.powerUps === false) {
	//     const payload = {
	//         "name" : lobbyForm?.name,
	//         "numberOfPlayers" : lobbyForm?.numberOfPlayer,
	//         "isPrivate" : lobbyForm?.isPrivate,
	//         "difficultyLevel": lobbyForm?.difficultyLevel,
	//         "isActiveLobby" : lobbyForm?.isActiveLobby,
	//         "pointsPerGame" : lobbyForm?.pointsPerGame,
	//         "timer" : lobbyForm?.timer,
	//         "gameName" : gameName,
	// 		"powerUps" : lobbyForm?.powerUps,
	// 		"user_id" : session?.user?.id 
	//     }
	//     try {
	//         await AddLobbyData(payload).then((response) => {
	//             handleClose()
	//             fetchLobbyData()
	//         })
	//     } catch (error) {
	//         console.error("Error :", error)
	//     }
	// } else{
	// }
	// handleError()
	//   }


	const handleSubmitData = async () => {
		let errors = {};

		if (lobbyForm?.name === '') {
			errors.name = 'Name field Required';
		}
		if (lobbyForm?.pointsPerGame === '') {
			errors.pointsPerGame = 'Add Game point';
		} else if (lobbyForm?.pointsPerGame === '0') {
			errors.pointsPerGame = 'Game point should be greater than 0';
		}
		if (lobbyForm?.difficultyLevel === '') {
			errors.difficultyLevel = 'Add Game level';
		}
		
		if (Object.keys(errors).length > 0) {
			// There are errors, set them and show error message
			setErrorfield(errors);
			setErrShow(true);
		} else {
			// const userID = await getSession()
			// console.log(userID, 'userID');
			// No errors, proceed with form submission
			setErrShow(false);

			const payload = {
				"name": lobbyForm?.name,
				"isPrivate": lobbyForm?.isPrivate,
				"difficultyLevel": lobbyForm?.difficultyLevel,
				"pointsPerGame": lobbyForm?.pointsPerGame,
				"timer": lobbyForm?.timer,
				"gameName": gameName,
				"powerUps": lobbyForm?.powerUps,
				"user_id": session?.user?.id
			}

			try {
				await AddLobbyData(payload);
				handleClose();
				fetchLobbyData();
			} catch (error) {
				console.error('Error:', error);
				// Handle error from API call
			}
		}
	};
   
	const handlePutLobbyApi = async (element , userID) => {
		const payload = {
			"lobby_id": element?.id.toString(),
			"user_id": userID?.user?.id.toString()
		}
		const response = await HandlePutLobby(payload)
		if (response) {
			fetchLobbyData()
		}
	}
	const handleUser = async (item) => {
        const userID = await getSession()
		if ((item?.player1 && item?.player1 !== userID?.user?.id) && item?.player2 === null) {
			handlePutLobbyApi(item, userID)
		} else {
			alert('Waiting For Other Player to join ')
		}
	}

	const fetchLobbyData = async () => {
		try {
			const lobbydata = await GetLobbyData(gameName)
			if (lobbydata) {
				setLobbyData(lobbydata)
			}
		} catch (error) {
			console.error('Error :', error)
		}
	}

	const handleSelectedData = () => { }

	const handleSession = async () => {
		const s = await getSession()
		setSession(s)
	}

	useEffect(() => {
		handleSession()
		fetchLobbyData()
	}, [])

	return (
		<div className='d-flex justify-content-start mt-3 vh-100'>
			<div className='w-100 border rounded p-4' style={{ maxWidth: '800px' }}>
				<div className='d-flex align-items-center justify-content-between border-bottom pb-3'>
					<h3 className='mb-0'>Lobby</h3>
					<Button className="btn btn-primary me-md-2" type='button' onClick={handleShow}>Create</Button>
				</div>
				<div className='w-100 pt-2' >
					<div className='d-flex flex-column'>
						{
							lobbyData.length > 0 && lobbyData?.map((item: any, i: number) => {
								return (
									<h6 style={{ cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }} className='d-flex align-items-center justify-content-between fw-medium py-2 w-auto text-primary' key={item.id} onClick={() => handleSelectedData(item)}>
										<span>{i + 1}. {item.name}</span>
										<span className='p' onClick={() => handleUser(item)}>{item.linkToJoin}</span>
										{/* <ArrowUpRightSquare className='h5'/> */}
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
						Add Lobby details
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<form>
						<div className="mb-3">
							<label className="form-label">Name*</label>
							<input type="text" className="form-control" value={lobbyForm.name} onChange={(e) => handleFormData(e, 'name')} />
							{errorfield && lobbyForm.name === '' ? <div className="form-text text-danger">{errorfield.name}</div> : null}
						</div>
						{/* <div className="mb-3">
		<label className="form-label">Number Of Players</label>
		<input type="text" className="form-control" value={lobbyForm.numberOfPlayer} onChange={(e) => handleFormData(e, 'numberOfPlayer')}/>
	  </div> */}
						<div className="mb-3 flex align-items-center">
							<label className="form-label">Points Per Game* - {lobbyForm.pointsPerGame}</label>
							<input type="range" className="form-range" min="0" max="100" value={lobbyForm.pointsPerGame} onChange={(e) => handleFormData(e, 'pointsPerGame')} />
							{errorfield && lobbyForm.pointsPerGame === '0' || lobbyForm.pointsPerGame === '' ? <div className="form-text text-danger">{errorfield.pointsPerGame}</div> : null}
						</div>
						<div className="mb-3">
							<label className="form-label">Difficulty Level*</label>
							<select className="form-select" aria-label="Default select example" value={lobbyForm.difficultyLevel} onChange={(e) => handleFormData(e, 'difficultyLevel')}>
								<option value={''}>Select Game Level</option>
								{
									gameLevel?.length > 0 && gameLevel.map((item, i) => {
										return <option value={item.value} key={item?.level}>{item.level}</option>
									})
								}
							</select>
							{/* {err && lobbyForm.difficultyLevel === '' ? <div className="form-text text-danger">{err}</div> : null} */}
							{errorfield && lobbyForm.difficultyLevel === '' ? <div className="form-text text-danger">{errorfield.difficultyLevel}</div> : null}
						</div>
						<div className="mb-3">
							<label className="form-label">Timer</label>
							<input type="text" className="form-control" value={lobbyForm.timer} onKeyDown={(e) => isNumber(e)} onChange={(e) => handleFormData(e, 'timer')} />
						</div>
						<div className='d-flex items-center flex-wrap'>
							<div className="mb-3 form-check me-5">
								<input type="checkbox" className="form-check-input" value={lobbyForm.isPrivate} onChange={(e) => handleFormData(e, 'isPrivate')} />
								<label className="form-check-label">Is This Private Lobby ?*</label>
								{errorfield && lobbyForm.isPrivate === false ? <div className="form-text text-danger">{errorfield.isPrivate}</div> : null}
							</div>
							<div className="mb-3 form-check form-switch">
								<input type="checkbox" className="form-check-input" value={lobbyForm.powerUps} onChange={(e) => handleFormData(e, 'powerUps')} />
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
	)
}

export default Lobby
