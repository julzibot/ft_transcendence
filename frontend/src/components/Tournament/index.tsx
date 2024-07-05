'use client'

import React, { useEffect, useState } from 'react'
import "bootstrap/dist/css/bootstrap.min.css"
import { Button, Modal } from 'react-bootstrap'
import { useParams, useRouter } from "next/navigation";
import { ArrowUpRightSquare } from 'react-bootstrap-icons';
import { AddTournamentData, GetTournamentData } from '@/services/tournaments';
import { MdOutlineOpenInNew } from "react-icons/md";

const gameLevel = [
  { value: 0, level: 'Beginner'},
  { value: 1, level: 'Intermediate'},
  { value: 2, level: 'Expert'}
]

interface props {
	gameName?:string
}
export default function Tournament({ gameName }:props) {
	const router = useRouter();
	const params = useParams()
	// const gamename = JSON.parse(localStorage.getItem('gameName'))
	const [modalShow, setModalShow] = useState(false);
	const [tournamentData, setTournamentData] = useState([])
	const [selectedTournament, setSelectedTournament] = useState()
	const [tounamentForm, setTounamentForm] = useState({
	  name: '',
	  numberOfPlayer: '',
	  isActiveTournament: false,
	  gamePoint: 0,
	  gameLevel: '',
	  timer: '0',
	  isPrivate: false,
	  powerUps: false
	})
	const [err, setErr] = useState('')
	const [errField, setErrFields] = useState({
		name: '',
		numberOfPlayer: '',
		isActiveTournament: '',
		gamePoint: '',
		gameLevel: '',
		isPrivate: '',
	})
	const handleShow = () => {
	  setTounamentForm ({
		name: '',
		numberOfPlayer: '',
		isActiveTournament: false,
		gamePoint: 0,
		gameLevel: '',
		timer: '0',
		isPrivate: false,
		powerUps: false
	  })
	  setErrFields({
		name: '',
		numberOfPlayer: '',
		isActiveTournament: '',
		gamePoint: '',
		gameLevel: '',
		isPrivate: '',
	  })
	  setModalShow(true)
	}
     
	const [ errshow, setErrShow] = useState(false)

	const handleClose = () => {
	  setModalShow(false)
	}
  
	const isNumber = (event) => {
	  const charCode = (event.which) ? event.which : event.keyCode
	  if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
		event.preventDefault()
	  } else {
		return true
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
  
	const handleSelectedData = (item:object) => {
	  // localStorage.setItem('GameName', JSON.stringify(gameName))
	  setSelectedTournament(item?.id)
	  router.push(`/tournaments/${item?.id}`)
	  // router.push(`/tournaments/${item?.gameName}/${item?.id}`)
	}
	
  
  const handleFormData = (e, key) => {
	setTounamentForm({
	  ...tounamentForm,
	  [key]: (key === 'isActiveTournament' || key === 'isPrivate' || key === 'powerUps') ? e.target.checked : e.target.value
	})
  }
  
//   const handleError = () => {
// 	if (tounamentForm?.name === '') {
// 	//    setErrFields('name')
//        setErr('Name field Required')
// 	} else if (tounamentForm?.numberOfPlayer === '') {
// 	//    setErrFields('numberOfPlayer')
// 	   setErr('Add Number of player')
// 	} else if (tounamentForm?.gamePoint === 0) {
// 		// setErrFields('gamePoint')
// 		setErr('Add Game point')
// 	}  else if (tounamentForm?.gameLevel === '') {
// 		// setErrFields('gameLevel')
// 		setErr('Add Game point')
// 	} else if (tounamentForm?.timer === '') {
// 		// setErrFields('timer')
// 		setErr('Time field Required')
// 	} else if (tounamentForm?.isPrivate === false ) {
// 		// setErrFields('isPrivate')
// 		setErr('This field Required')
// 	} else if (tounamentForm?.powerUps === false) {
// 		// setErrFields('powerUps')
// 		setErr('Power Ups field Required')
// 	}
//   }

//   const handleSubmitData = async () => {
//     if (tounamentForm?.name !== '' || tounamentForm?.numberOfPlayer !== '' || tounamentForm?.gamePoint !== '' || tounamentForm?.gameLevel !== '' || tounamentForm?.timer !== '' || tounamentForm?.isPrivate !== false || tounamentForm?.powerUps !== false) {
// 		handleError()
// 		setErrShow(true)
// 	}

// 	if (tounamentForm?.name !== '' && tounamentForm?.numberOfPlayer !== '' && tounamentForm?.gamePoint !== '' && tounamentForm?.gameLevel !== '' && tounamentForm?.timer !== '' && tounamentForm?.isPrivate !== false && tounamentForm?.powerUps !== false) {
// 		setErrShow(false)
// 		const payload = {
// 		"name": tounamentForm?.name,
// 		"numberOfPlayers": tounamentForm?.numberOfPlayer,
// 		"isPrivate": tounamentForm?.isPrivate,
// 		"difficultyLevel": tounamentForm?.gameLevel,
// 		"isActiveTournament": tounamentForm?.isActiveTournament,
// 		"pointsPerGame": tounamentForm?.gamePoint,
// 		"timer": Number(tounamentForm?.timer),
// 		"gameName": gameName,
// 		"powerUps": tounamentForm?.powerUps,
// 	  }
// 	  try {
// 		await AddTournamentData(payload).then((response) => {
// 		  handleClose()
// 		  fetchTournamentData()
// 		})
// 	  } catch (error) {
// 		console.error('Error :', error)
// 	  }
// 	} 
// 	// else {
// 	// 	// setErr('Required')
// 	// 	handleError()
// 	// 	setErrShow(true)
// 	// }
//   }
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
            "powerUps": tounamentForm?.powerUps,
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
	<div className='d-flex justify-content-end mt-3 vh-100'>
	<div className='w-100 border rounded p-4' style={{maxWidth:'800px'}}>
	  <div className='d-flex align-items-center justify-content-between border-bottom pb-3'>
		<h3 className='mb-0'>Tournaments</h3>
		<Button className="btn btn-primary me-md-2" type='button' onClick={handleShow}>Create</Button>
	  </div>
	  <div className='w-100 pt-2' >
		<h4 className='py-2 fw-light'>All Tournaments</h4>
		<div className='d-flex flex-column'>
		  {
			tournamentData.length > 0 && tournamentData?.map((item:any, i:number) => {
			  return(
				<h6 style={{ cursor:'pointer', borderBottom:'1px solid #f0f0f0'}} className='d-flex align-items-center justify-content-between fw-medium py-2 w-auto text-primary' key={item.id} onClick={() => handleSelectedData(item)}>
				  <span>{i + 1}. {item.name}</span>
				  <ArrowUpRightSquare className='h5'/>
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
		<label className="form-label">Name*</label>
		<input type="text" className="form-control" value={tounamentForm.name} onChange={(e) => handleFormData(e, 'name')}/>
		{/* {err && errField === 'name' && tounamentForm?.name === '' ? <div className="form-text text-danger">{err}</div> : null} */}
		{errField && tounamentForm?.name === '' ? <div className="form-text text-danger">{errField.name}</div> : ''}
	  </div>
	  <div className="mb-3">
		<label className="form-label">Number Of Players*</label>
		<input type="text" className="form-control" value={tounamentForm.numberOfPlayer} onKeyDown={(e) => isNumber(e)} onChange={(e) => handleFormData(e, 'numberOfPlayer')}/>
		{/* {err && errField === 'numberOfPlayer' && tounamentForm?.numberOfPlayer === '' || tounamentForm?.numberOfPlayer === '0' ? <div className="form-text text-danger">{err}</div> : null} */}
		{errField && tounamentForm?.numberOfPlayer === '' ? <div className="form-text text-danger">{errField.numberOfPlayer}</div> : ''}
	  </div>
	  {/* <div className="mb-3 form-check">
		<input type="checkbox" className="form-check-input" value={tounamentForm.isActiveTournament} onChange={(e) => handleFormData(e, 'isActiveTournament')}/>
		<label className="form-check-label">Is Active Tournament</label>
	  </div> */}
	  <div className="mb-3 flex align-items-center">
	  <label className="form-label">Points Per Game* - {tounamentForm.gamePoint}</label>
	  <input type="range" className="form-range" min="0" max="100" value={tounamentForm.gamePoint} onChange={(e) => handleFormData(e, 'gamePoint')}/>
	  {errField &&  tounamentForm?.gamePoint === 0 || tounamentForm?.gamePoint === null ? <div className="form-text text-danger">{errField.gamePoint}</div> : ''}
	  {/* {err && errField === 'gamePoint' &&  tounamentForm?.gamePoint === 0 || tounamentForm?.gamePoint === null ? <div className="form-text text-danger">{err}</div> : null} */}
		{/* <label className="form-label me-3">Points Per Game</label> */}
		{/* <input type="range" min="1" max="100" value={tounamentForm.gamePoint} className="slider" id="myRange" onChange={(e) => handleFormData(e, 'gamePoint')}/> {tounamentForm.gamePoint} */}
		{/* <input type="text" className="form-control" value={tounamentForm.gamePoint} onKeyDown={(e) => isNumber(e)} onChange={(e) => handleFormData(e, 'gamePoint')}/> */}
	  </div>
	  <div className="mb-3">
		<label className="form-label">Difficulty Level*</label>
		<select className="form-select" aria-label="Default select example" value={tounamentForm.gameLevel} onChange={(e) => handleFormData(e, 'gameLevel')}>
		  <option value={''}>Select Game Level</option>
		  { 
			gameLevel?.length > 0 && gameLevel.map((item,  i) => {
			  return <option value={item.value} key={item?.level}>{item.level}</option>
			})
		  }
		</select>
		{/* {err && errField === 'gameLevel' && tounamentForm?.gameLevel === '' ? <div className="form-text text-danger">{err}</div> : null} */}
		{errField && tounamentForm?.gameLevel === '' ? <div className="form-text text-danger">{errField.gameLevel}</div> : ''}
	  </div>
	  <div className="mb-3">
		<label className="form-label">Timer</label>
		<input type="text" className="form-control" value={tounamentForm.timer} onKeyDown={(e) => isNumber(e)} onChange={(e) => handleFormData(e, 'timer')}/>
		{/* {err && errField === 'timer' && (tounamentForm?.timer === '' || tounamentForm?.timer === '0') ? <div className="form-text text-danger">{err}</div> : null} */}
	  </div>
	  <div className='d-flex items-center flex-wrap'>
		<div className="mb-3 form-check me-5">
			<input type="checkbox" className="form-check-input" value={tounamentForm.isPrivate} onChange={(e) => handleFormData(e, 'isPrivate')}/>
			<label className="form-check-label">Is This Private Tournament ?*</label>
			{errField && tounamentForm?.isPrivate === false ? <div className="form-text text-danger">{errField.isPrivate}</div> : ''}
			{/* {err && errField === 'isPrivate' && tounamentForm?.isPrivate === false ? <div className="form-text text-danger">{err}</div> : null} */}
		</div>
		<div className="mb-3 form-check form-switch">
			<input type="checkbox" className="form-check-input" value={tounamentForm.powerUps} onChange={(e) => handleFormData(e, 'powerUps')}/>
			<label className="form-check-label">Power ups</label>
			{/* {err && errField === 'powerUps' && tounamentForm?.powerUps === false ? <div className="form-text text-danger">{err}</div> : null} */}
		</div>
	  </div>
	</form>
	</Modal.Body>
	<Modal.Footer>
	  <Button variant="secondary" onClick={handleClose}>Close</Button>
	  <Button variant="primary" onClick ={handleSubmitData}>Add</Button>
	</Modal.Footer>
  </Modal>


  </div>
  );
}