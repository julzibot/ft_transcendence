"use client";

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/app/lib/AuthContext';
import { BACKEND_URL } from '@/config';
import { TournamentSettingsType, ParticipantType } from '@/types/TournamentSettings';
import styles from '../GameSettingsStyles.module.css'
import { PersonFillUp, Controller, Toggle2On, Toggle2Off, LightningFill, ClockFill, Activity, TrophyFill, Alphabet, CircleFill } from 'react-bootstrap-icons'


export default function TournamentLobby() {
  const { id } = useParams()
  const { session } = useAuth()
  const [participantsList, setParticipantsList] = useState<ParticipantType[]>([])
  const [tournamentData, setTournamentData] = useState()
  const [isMounted, setIsMounted] = useState(false)
  const [isTranslated, setIsTranslated] = useState(false)

  useEffect(() => {
    const fetchTournamentData = async () => {
      const response = await fetch(`${BACKEND_URL}/api/tournament/${id}/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })
      if(response.ok) {
        const data = await response.json()
        setParticipantsList(data.participants)
        setTournamentData(data.tournament)
      }
    }
    fetchTournamentData()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 1000);
    return () => clearTimeout(timer)
  }, []);

  return (
    <>
      <div className="d-flex flex-column align-items-center justify-content-center mt-3">
        <div className={`card mt-1 mb-4 m-2 p-1 ps-4 pe-4  ${styles.pageTitle} ${isMounted ? styles.mounted : ''}`}>
          <div className="card-title text-center">
            <h2 className="mt-3 fw-bold">{tournamentData?.name}</h2>
          </div>
        </div>
      </div>
      <div className={`card mt-3 col-4 ${styles.gameSettingsCard} ${isTranslated ? styles.translated : ''} ${isMounted ? styles.mounted : ''}`}>
        <div className="card-body">
        <h1>In Lobby</h1>
        <div className="mt-2 border">
							{
								participantsList && participantsList.map((participant: ParticipantType, index: number) => {
									return (
										<div 
											key={index} 
											className={`${participantsList.length - 1 === index ? 'border-bottom' : ''} ${index === 0 ?  '' : 'border-top'} d-flex flex-row align-items-center fw-bold fs-5`}
                      style={{ height: '50px' }}
                      >
											<div className="border-end justify-content-center col-5 d-flex align-items-center">
												<div className="d-flex flex-row align-items-center">
                          <span className="me-2 text-truncate" style={{ maxWidth: 'calc(80%)' }}>{participant.user.username}</span>
														< div className="ms-2 position-relative border border-2 border-dark-subtle rounded-circle" style={{ width: '30px', height: '30px', overflow: 'hidden' }}>
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
																src={`${BACKEND_URL}${participant.user.image}`}
															/>
														</div>
												</div>
											</div>
                      <div className="border-end col-1 d-flex justify-content-center align-items-center">
                        <TrophyFill size={15} />
                        <span className="ms-2">{participant.wins}</span>
                      </div>
                      <div className="border-end col-1 d-flex justify-content-center align-items-center">
                        <Controller size={15} />
                        <span className="ms-2">{participant.gamesPlayed}</span>
                      </div>
                      <div className="border-end col-2 d-flex justify-content-center align-items-center">
                      {
                        session.user.id === participant.user.id &&
                        <button className="btn btn-warning">
                          Ready
                        </button>
                      }
                      </div>
										</div>
									)
								})
							}
            </div>
        </div>
      </div>
    </>
  )
}