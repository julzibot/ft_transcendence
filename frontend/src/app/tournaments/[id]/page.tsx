"use client"

import React, { useEffect, useState } from 'react'
import "bootstrap/dist/css/bootstrap.min.css"
import { Button } from 'react-bootstrap'
import { useParams } from 'next/navigation'
import { createMatchMaking, createMatchMakingTournament, fetchTournamentInfo, joinTournament, leaveTournament } from '@/services/tournaments'
import { getSession, useSession } from 'next-auth/react'
import Link from 'next/link'

function DetailsPage() {
  const param = useParams<any>()
  // const { data: session, status} = useSession()
  const [tournamentData, setTournamentData] = useState<any>([])
  const [join, setJoin] = useState(false)
  const [isparticipent, setIsparticipent]= useState(false)
  const [participantData, setParticipantData] = useState([])
  const [participantKey, setparticipentKey] = useState([])
  const [onceUpdate, setOnceUpdate] = useState(false)
  const [session, setIsSession] = useState()
  const [nextRound, setNextRound] = useState(false)
  const [leaveOff, setLeaveOff] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSingleTournament = async () => {
    try {
      await fetchTournamentInfo(param?.id).then((response) => {
        setTournamentData(response?.data)
        init(response?.data)
        setLoading(false)
      })
    } catch (error) {
      console.error('Error : ', error)
    }
  }
  
  const joinParticipants = async () => {
    setLoading(true)
    try {
      await joinTournament(tournamentData?.detail[0]?.id, session?.user?.id).then((response) => {
        if (response) {
          setIsparticipent(true)
          handleSingleTournament()
          setLoading(false)
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
    setLoading(true)
    if (!onceUpdate) {
      setOnceUpdate(true)
      handleSingleTournament()
    }
	}, [onceUpdate])
 
  const init = async (data) => {
    const session = await getSession()
    setIsSession(session)
    const userjoin = data?.particpants?.find((v) => v.user_id === session.user.id)
    if (userjoin !== undefined) {
      setIsparticipent(true)
      if (data?.detail[0]?.numberOfPlayers < data?.particpants?.length) {
        setJoin(true)
      }
    } else {
      if (data?.detail[0]?.numberOfPlayers === data?.particpants?.length ||
        data?.detail[0]?.numberOfPlayers <= data?.particpants?.length 
      ) {
        setJoin(false)
      } else {
        setJoin(true)
      }
    }
  
    if (data?.detail[0]?.numberOfPlayers === data?.particpants?.length) {
      setLoading(true)
      const defaultRoundID = data?.detail[0]?.round > 0 ? data?.detail[0]?.round : 1
      await createMatchMakingTournament(data?.detail[0]?.id, defaultRoundID).then(async (res) => {
        if (res?.particpants === undefined) {
          await createMatchMaking(data?.detail[0]?.id, defaultRoundID).then(async () => {
            await createMatchMakingTournament(data?.detail[0]?.id, defaultRoundID).then((res) => {
              handlePlayerKey(res?.particpants)
              setParticipantData(res?.particpants)
              setLeaveOff(true)
              setLoading(false)
            })
          })
        } else {
          if (res?.particpants && res?.particpants?.length > 0) {
            const callRoundApi = handleWinner(res?.particpants)
            if (data?.detail[0]?.tournamentWinner === null && callRoundApi) {
              // next game
              handlePlayerKey(res?.particpants)
              setParticipantData(res?.particpants)
              setLeaveOff(true)
              setNextRound(true)
            } else {
              handlePlayerKey(res?.particpants)
              setParticipantData(res?.particpants)
              setLeaveOff(true)
            }
          }
          setLoading(false)
        }
      })
    }
  }
  
  const handlePlayerKey = (data: string | any[]) => {
    for (let index = 0; index < data?.length; index++) {
      let r = Object.keys(data[index]).filter((v) => v?.includes("player") && v?.includes("_name"))
      setparticipentKey(r)  
    }
  }

  const handleWinner = (data) => {
    let count = 0
    for (let index = 0; index < data?.length; index++) {
      const ele = data[index]
      if (ele.winner) {
        count +=1
      }
    }
    if (data.length === count) {
      return true
    } else {
      return false
    }
  }
  
  const handleNextGame = async() => {
    const roundID = tournamentData?.detail[0]?.round + 1
    await createMatchMaking(tournamentData?.detail[0]?.id, roundID).then(async () => {
      await createMatchMakingTournament(tournamentData?.detail[0]?.id, roundID).then((res) => {
        handlePlayerKey(res?.particpants)
        setParticipantData(res?.particpants)
        setNextRound(false)
      })
    })
  }

  return (
    <div className='d-flex justify-content-center mt-3 vh-100'>
      <div className='w-100 border rounded p-4' style={{maxWidth:'800px'}}>
        <div className='d-flex justify-content-between'>
          <h4>Tournament Details</h4>
          { join && <div>
            { !isparticipent  ? <Button onClick={joinParticipants}>Join</Button> 
              :
              !leaveOff && <Button onClick={LeaveParticipants}>Leave</Button>
            }
          </div> }
        </div>
          <div className='py-4'>
              { tournamentData?.detail?.length > 0 && tournamentData?.detail.map((items,) => {
                return (
                  <ul key={items?.name} style={{ listStyle:'none'}} className='p-0'>
                    <li className="fw-bold fs-5">{items?.name}</li>
                    <li> Number of Player : {items?.numberOfPlayers ? items?.numberOfPlayers : ' -- ' }</li>
                    <li> Per Game points : {items?.pointsPerGame ? items?.pointsPerGame : ' -- ' }</li>
                    <li> Timer : {items?.timer ? items?.timer : ' -- ' }</li>
                  </ul>
                )
              })}
              { !loading && tournamentData?.particpants?.length === 0 && <p className='text-center'> No particpants Added </p>}
          </div>
          {tournamentData?.particpants?.length > 0  && <div className='py-2'>
            <h5 className='mb-2 fw-bold'>Tournament Participants</h5>
              { tournamentData?.particpants.map((items, i) => {
                return (
                  <ul key={items?.user_id} style={{ listStyle:'none'}} className='p-0'>
                    <li>{i+1}. {items?.user_name}</li>
                  </ul>
                )
              })}
          </div>}
          {participantData?.length > 0  && <div className='py-2 overflow-auto' style={{ height:'auto'}}>
              { participantData?.map((items, index) => {
                return (
                  <div key={items?.linkToJoin}>
                    {index === 0 && <h4 className='mb-3 fw-bold text-center'>Round : {items.round_id}</h4>}
                    <ul key={items?.user_id} style={{ listStyle:'none'}} className='p-0'>
                        {participantKey.map((v,i) => {
                          const player = v.replace('_name', '')
                        return(
                          <li key={i}>
                              <div className='d-flex align-items-center justify-content-between'>
                                {items?.[v] && tournamentData?.detail[0]?.tournamentWinner === null && <p className='mb-2'>{items?.[v]} <span style={{color:"#20c620", fontSize:'14px'}}>{items?.[player] === items?.winner? '- WINNER' : ''}</span></p> }
                                {items?.[v] && tournamentData?.detail[0]?.tournamentWinner && <p className='mb-2'>{items?.[v]} <span style={{color:"#20c620", fontSize:'14px'}}>{items?.[player] === tournamentData?.detail[0]?.tournamentWinner ? '- WINNER' : ''}</span></p> }
                                {items[player] === session?.user?.id && <p className='mb-2' style={{ fontSize:'14px'}}><Link href={items?.linkToJoin}>{items?.linkToJoin}</Link></p>}
                              </div>
                            </li>
                        ) 
                        })}
                    </ul>
                  </div>
                )
              })}
          </div>}
          {nextRound && <div className='text-end'>
            <button type='button' className='btn btn-primary' onClick={handleNextGame}>Next Round</button>
          </div>}
          {loading && <p className='text-center'>
              <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
              <span role="status">Loading...</span>
          </p> }
        </div>
    </div>
  )
}

export default DetailsPage
