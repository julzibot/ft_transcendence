"use client"

import React, { useEffect, useState } from 'react'
import "bootstrap/dist/css/bootstrap.min.css"
import { Button, Modal } from 'react-bootstrap'
import { useParams, useRouter } from "next/navigation";
import { ArrowUpRightSquare } from 'react-bootstrap-icons';
import { AddTournamentData, GetTournamentData } from '@/services/tournaments';

const gameLevel = [
  { value: 0, level: 'Beginner'},
  { value: 1, level: 'Intermediate'},
  { value: 2, level: 'Expert'}
]

function TournamentPage() {
  const router = useRouter();
  const params = useParams()
  const [modalShow, setModalShow] = useState(false);
  const [tournamentData, setTournamentData] = useState([])
  const [selectedTournament, setSelectedTournament] = useState()
  const [tounamentForm, setTounamentForm] = useState({
    name: '',
    numberOfPlayer: '',
    isActiveTournament: false,
    gamePoint: 0,
    gameLevel: '',
    timer: '',
    isPrivate: false,
    powerUps: false
  })
  const [err, setErr] = useState('')
  
  const handleShow = () => {
    setTounamentForm ({
      name: '',
      numberOfPlayer: '',
      isActiveTournament: false,
      gamePoint: 0,
      gameLevel: '',
      timer: '',
      isPrivate: false
    })
    setModalShow(true)
  }

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
        const tournamentdata = await GetTournamentData()
        setTournamentData(tournamentdata)
    } catch (error) {
        console.error('Error :', error)
    }
  }

  const handleSelectedData = (item:object) => {
    setSelectedTournament(item?.id)
    router.push(`/tournaments/${item?.id}`)
  }
  

const handleFormData = (e, key) => {
  setTounamentForm({
    ...tounamentForm,
    [key]: (key === 'isActiveTournament' || key === 'isPrivate' || key === 'powerUps') ? e.target.checked : e.target.value
  })
}

const handleSubmitData = async () => {
  if (tounamentForm?.name === '') {
    setErr('Required field')
  } else {
    const payload = {
      "name": tounamentForm?.name,
      "numberOfPlayers": tounamentForm?.numberOfPlayer,
      "isPrivate": tounamentForm?.isPrivate,
      "difficultyLevel": tounamentForm?.gameLevel,
      "isActiveTournament": tounamentForm?.isActiveTournament,
      "pointsPerGame": tounamentForm?.gamePoint,
      "timer": Number(tounamentForm?.timer),
      "powerUps": tounamentForm?.powerUps
    }
    try {
      await AddTournamentData(payload).then((response) => {
        handleClose()
        fetchTournamentData()
      })
    } catch (error) {
      console.error('Error :', error)
    }
  }
}

useEffect(() => {
  fetchTournamentData()
}, [])


  return (
    <div className='d-flex justify-content-center mt-3 text-light'>
      <div className='w-100 border rounded p-4' style={{maxWidth:'800px'}}>
        <div className='d-flex align-items-center justify-content-between border-bottom pb-3'>
          <h3 className='mb-0'>Tournaments</h3>
          <Button className="btn btn-outline-light me-md-2" type='button' onClick={handleShow}>Create</Button>
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
          {err && <div className="form-text text-danger">{err}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Number Of Players</label>
          <input type="text" className="form-control" value={tounamentForm.numberOfPlayer} onKeyDown={(e) => isNumber(e)} onChange={(e) => handleFormData(e, 'numberOfPlayer')}/>
        </div>
        <div className="mb-3 flex align-items-center">
        <label className="form-label">Points Per Game - {tounamentForm.gamePoint}</label>
        <input type="range" className="form-range" min="0" max="100" value={tounamentForm.gamePoint} onChange={(e) => handleFormData(e, 'gamePoint')}/>
        </div>
        <div className="mb-3">
          <label className="form-label">Difficulty Level</label>
          <select className="form-select" aria-label="Default select example" value={tounamentForm.gameLevel} onChange={(e) => handleFormData(e, 'gameLevel')}>
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
          <input type="number" className="form-control" value={tounamentForm.timer} onKeyDown={(e) => isNumber(e)} onChange={(e) => handleFormData(e, 'timer')}/>
        </div>
        <div className="mb-3 form-check">
          <input type="checkbox" className="form-check-input" value={tounamentForm.isPrivate} onChange={(e) => handleFormData(e, 'isPrivate')}/>
          <label className="form-check-label">Is This Private Tournament ?</label>
        </div>
        <div className="mb-3 form-check form-switch">
          <input type="checkbox" className="form-check-input" value={tounamentForm.powerUps} onChange={(e) => handleFormData(e, 'powerUps')} />
          <label className="form-check-label">Power ups</label>
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

export default TournamentPage
