"use client"

import { ParticipantType } from "@/types/TournamentSettings";
import Image from "../Utils/Image";
import { Controller, TrophyFill } from 'react-bootstrap-icons'
import { useState, useEffect } from 'react'
import styles from './EndTournamentCard.module.css'
import { useRouter } from 'next/navigation'

export default function EndTournamentCard({ participants }: { participants: ParticipantType[] }) {
  const [winnerShow, setWinnerShow] = useState(false)
  const [scoreShow, setScoreShow] = useState(false)
  const [winners, setWinners] = useState<ParticipantType[]>()
  const router = useRouter()

  function findWinner() {
    const winner: ParticipantType[] = []
    winner.push(participants[0]) // at least one winner
    for (let i = 1; participants[i] && participants[i].wins === participants[i - 1].wins && participants[i].gamesPlayed === participants[i - 1].gamesPlayed; i++)
      winner.push(participants[i])
    setWinners(winner)
  }


  useEffect(() => {
    findWinner()
    setTimeout(() => {
      setWinnerShow(true)
    }, 1500)
    setTimeout(() => {
      setScoreShow(true)
    }, 3000)
  }, [])


  return (
    <>
      <div className={`modal fade show d-block`} id="staticBackDrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={10}>
        <div className={`modal-dialog modal-dialog-centered`}>
          <div className={`modal-content`}>
            <div className="modal-header justify-content-center">
              <div className="modal-title">
                {
                  winners && <h5>{`And the winner${winners.length > 1 ? 's' : ''} ${winners.length > 1 ? 'are' : 'is'}...`}</h5>
                }
              </div>
            </div>
            <div className="modal-body">
              {
                winners && winners.map((winner: ParticipantType, index) => (
                  <div key={index} className={`d-flex justify-content-evenly align-items-center`}>
                    <Image className={`${styles.winner} ${winnerShow ? styles.mounted : ""} col-7`} src={winner.user.image} whRatio="90px" alt="tournament winner" />
                    <h1 className={`${styles.winner} ${winnerShow ? styles.mounted : ""} col-5`}>{winner.user.username}</h1>
                  </div>

                ))
              }
            </div>
            <hr />
            <div className="d-flex justify-content-evenly mb-2">
              <div className="d-flex align-items-center">
                <TrophyFill className={`${styles.score} ${scoreShow ? styles.mounted : ""}`} size={80} />
                <h1 className={`${styles.score} ${scoreShow ? styles.mounted : ""} ms-3`}>{participants[0].wins}</h1>
              </div>
              <div className="d-flex align-items-center">
                <h1 className={`${styles.score} ${scoreShow ? styles.mounted : ""} me-3`}>{participants[0].gamesPlayed}</h1>
                <Controller className={`${styles.score} ${scoreShow ? styles.mounted : ""}`} size={80} />
              </div>
            </div>
            <hr />
            <div className="d-flex align-items-center justify-content-center mb-4">
              <button className="btn btn-primary" onClick={() => router.replace('/tournaments')}>Back to Lobbies</button >
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  )
}