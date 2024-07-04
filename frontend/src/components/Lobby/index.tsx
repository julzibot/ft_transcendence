import React, { useEffect, useState } from 'react'
import "bootstrap/dist/css/bootstrap.min.css"
import { Button, Modal } from 'react-bootstrap'
import { ArrowUpRightSquare } from 'react-bootstrap-icons';
import { GetLobbyData, AddLobbyData } from '@/services/tournaments';

const gameLevel = [
    { value: 0, level: 'Beginner'},
    { value: 1, level: 'Intermediate'},
    { value: 2, level: 'Expert'}
]

const Lobby = ({}) => {

    const [lobbyData, setLobbyData] = useState([])
    const [modalShow, setModalShow] = useState(false);
    const [err, setErr] = useState('')
    const [lobbyForm, setLobbyForm] = useState({
        name: '',
        numberOfPlayer: '',
        isPrivate: true,
        difficultyLevel: '',
        isActiveLobby: true,
        pointsPerGame: '0',
        timer: '',
        gameName: ''
      })

    const handleClose = () => {
        setModalShow(false)
      }

      const handleFormData = (e, key) => {
        setLobbyForm(
            {
            ...lobbyForm,
            [key] : (key === "isActiveLobby" || key === "isPrivate") ? (e.target.checked) : (e.target.value)
            }
        )
      }

	  const handleSubmitData = async () => {
		if (lobbyForm?.name === '') {
            setErr('Required')
        } else{
            const payload = {
                "name" : lobbyForm?.name,
                "numberOfPlayers" : lobbyForm?.numberOfPlayer,
                "isPrivate" : lobbyForm?.isPrivate,
                "difficultyLevel": lobbyForm?.difficultyLevel,
                "isActiveLobby" : lobbyForm?.isActiveLobby,
                "pointsPerGame" : lobbyForm?.pointsPerGame,
                "timer" : lobbyForm?.timer,
                "gameName" : lobbyForm?.gameName
            }
            try {
                await AddLobbyData(payload).then((response) => {
                    handleClose()
                    fetchLobbyData()
                })
            } catch (error) {
                console.error("Error :", error)
            }
        }
	  }

      const fetchLobbyData = async () => {
        try {
            const lobbydata = await GetLobbyData()
            setLobbyData(lobbydata)
            console.log(lobbydata)
        } catch (error) {
            console.error('Error :', error)
        }
      }

      const handleSelectedData = () => {}

      useEffect(() => {
        fetchLobbyData()
      },[])

  return (
      <div className='d-flex justify-content-start mt-3 vh-100'>
	<div className='w-100 border rounded p-4' style={{maxWidth:'800px'}}>
	  <div className='d-flex align-items-center justify-content-between border-bottom pb-3'>
		<h3 className='mb-0'>Lobby</h3>
		<Button className="btn btn-primary me-md-2" type='button' onClick={() => setModalShow(true)}>Create</Button>
	  </div>
	  <div className='w-100 pt-2' >
		<div className='d-flex flex-column'>
		  {
			lobbyData.length > 0 && lobbyData?.map((item:any, i:number) => {
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
		Add Lobby details
	  </Modal.Title>
	</Modal.Header>
	<Modal.Body>
	<form>
	  <div className="mb-3">
		<label className="form-label">Name*</label>
		<input type="text" className="form-control" value={lobbyForm.name} onChange={(e) => handleFormData(e, 'name')}/>
		{err && <div className="form-text text-danger">{err}</div>}
	  </div>
	  <div className="mb-3">
		<label className="form-label">Number Of Players</label>
		<input type="text" className="form-control" value={lobbyForm.numberOfPlayer} onChange={(e) => handleFormData(e, 'numberOfPlayer')}/>
	  </div>
	  <div className="mb-3 flex align-items-center">
	  <label className="form-label">Points Per Game - {lobbyForm.pointsPerGame}</label>
	  <input type="range" className="form-range" min="0" max="100" value={lobbyForm.pointsPerGame} onChange={(e) => handleFormData(e, 'pointsPerGame')}/>
	  </div>
	  <div className="mb-3">
		<label className="form-label">Difficulty Level</label>
		<select className="form-select" aria-label="Default select example" value={lobbyForm.difficultyLevel} onChange={(e) => handleFormData(e, 'difficultyLevel')}>
		  <option value={''}>Select Game Level</option>
		  { 
			gameLevel?.length > 0 && gameLevel.map((item,  i) => {
			  return <option value={item.value} key={item?.level}>{item.level}</option>
			})
		  }
		</select>
	  </div>
	  <div className="mb-3">
		<label className="form-label">timer</label>
		<input type="text" className="form-control" value={lobbyForm.timer} onChange={(e) => handleFormData(e, 'timer')}/>
	  </div>
	  <div className="mb-3 form-check">
		<input type="checkbox" className="form-check-input" value={lobbyForm.isPrivate} onChange={(e) => handleFormData(e, 'isPrivate')}/>
		<label className="form-check-label">Is This Private Tournament ?</label>
	  </div>
	</form>
	</Modal.Body>
	<Modal.Footer>
	  <Button variant="secondary" onClick={handleClose}>Close</Button>
	  <Button variant="primary" onClick ={handleSubmitData}>Add</Button>
	</Modal.Footer>
  </Modal>


  </div>
  )
}

export default Lobby
