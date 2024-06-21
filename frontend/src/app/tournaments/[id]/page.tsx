"use client"

import React, { useEffect, useState } from 'react'
import "bootstrap/dist/css/bootstrap.min.css"
import { Button } from 'react-bootstrap'
import { useParams } from 'next/navigation'
import { createMatchMakingTournament, fetchTournamentInfo, joinTournament, leaveTournament } from '@/services/tournaments'
import { getSession, useSession } from 'next-auth/react'

function DetailsPage() {
  const param = useParams()
  const { data: session, status} = useSession()
  const [tournamentData, setTournamentData] = useState([])
  const [join, setJoin] = useState(false)
  const [isparticipent, setIsparticipent]= useState(false)
  
  const handleSingleTournament = async () => {
    try {
      await fetchTournamentInfo(param?.id).then((response) => {
        setTournamentData(response?.data)
        init(response?.data)
      })
    } catch (error) {
      console.error('Error : ', error)
    }
  }
  
  const joinParticipants = async () => {
    try {
      await joinTournament(tournamentData?.detail[0]?.id, session?.user?.id).then((response) => {
        if (response) {
          setIsparticipent(true)
          handleSingleTournament()
        }
      }) 
    } catch (error) {
      console.error('Error : ', error)
    }
  } 
  
  const LeaveParticipants = async () => {
    try {
      await leaveTournament(tournamentData?.detail[0]?.id, session?.user?.id).then((response) => {
        if (response) {
          setIsparticipent(false)
          handleSingleTournament()
        }
      }) 
    } catch (error) {
      console.error('Error : ', error)
    }
  } 
  
  useEffect(() => {
    if (param?.id) {
      handleSingleTournament()
    }
	}, [param?.id])
 
  const init = async (data) => {
    const session = await getSession()
    const userjoin = data?.particpants?.find((v) => v.user_id === session.user.id)
    if (userjoin !== undefined) {
      setIsparticipent(true)
      setJoin(true)
    } else {
      if (data?.detail[0]?.numberOfPlayers === data?.particpants?.length ||
        data?.detail[0]?.numberOfPlayers <= data?.particpants?.length 
      ) {
        setJoin(false)
      } else {
        setJoin(true)
      }
    }
    createMatchMakingTournament(data?.detail[0]?.id, 1)
  }
  return (
    <div className='d-flex justify-content-center mt-3 vh-100'>
      <div className='w-100 border rounded p-4' style={{maxWidth:'800px'}}>
        <div className='d-flex justify-content-between'>
          <h4>Tournament Details</h4>
          { join && <div>
            { !isparticipent  ? <Button onClick={joinParticipants}>Join</Button> 
              :
              <Button onClick={LeaveParticipants}>Leave</Button>
            }
          </div> }
        </div>
        <div className='py-4'>
            { tournamentData?.detail?.length > 0 && tournamentData?.detail.map((items) => {
              return (
                <ul key={items?.name} style={{ listStyle:'none'}} className='p-0'>
                  <li className="fw-bold">{items?.name}</li>
                  <li> Number of Player : {items?.numberOfPlayers ? items?.numberOfPlayers : ' -- ' }</li>
                  <li> Per Game points : {items?.pointsPerGame ? items?.pointsPerGame : ' -- ' }</li>
                  <li> Timer : {items?.timer ? items?.timer : ' -- ' }</li>
                </ul>
              )
            })}
            {tournamentData?.particpants?.length > 0 ? '' : <p className='text-center'> No particpants Added </p>}
        </div>
        {tournamentData?.particpants?.length > 0  && <div className='py-2'>
          <h6 className='mb-2'>Tournament Participants</h6>
            { tournamentData?.particpants.map((items, i) => {
              return (
                <ul key={items?.user_id} style={{ listStyle:'none'}} className='p-0'>
                  <li className="fw-bold">{i+1}. {items?.user_name}</li>
                </ul>
              )
            })}
        </div>}
      </div>
    </div>
  )
}

export default DetailsPage
