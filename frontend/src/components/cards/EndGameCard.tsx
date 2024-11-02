"use client"

import { useRouter } from 'next/navigation'
import "bootstrap/dist/css/bootstrap.min.css"
import styles from './EndGameCard.module.css'
import { useState, useEffect } from 'react'

export default function EndGameCard({ gameMode, tournamentLink }: { gameMode: 'TOURNAMENT' | 'ONLINE' | 'LOCAL' | null, tournamentLink?: string }) {
	const router = useRouter()
	const [show, setShow] = useState<Boolean>(false)
	const [url, setUrl] = useState<string>('')

	useEffect(() => {
		switch (gameMode) {
			case 'TOURNAMENT':
				setTimeout(() => {
					router.push(`/tournaments/${tournamentLink}`)
				}, 3000)
				break
			case 'ONLINE':
				setShow(true)
				setUrl('/game/online/')
				break
			case 'LOCAL':
				setShow(true)
				setUrl('/game/local/')
				break
		}
		setTimeout(() => {
			setShow(true)
		}, 2000)
	}, [])

	if (gameMode === 'TOURNAMENT')
		return null
	return (
		<>
			<div className={`modal fade ${show ? "show" : ''} d-block`} id="staticBackDrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={10}>
				<div className={`modal-dialog modal-dialog-centered`}>
					<div className={`modal-content ${styles.endGameCard}`}>
						<div className="modal-header justify-content-center">
							<div className="modal-title">
								<h5>Game is over ! Choose what to do</h5>
							</div>
						</div>
						<div className="modal-footer justify-content-center">
							<button type="button" className="btn btn-outline-light" onClick={() => router.push(url)} data-bs-dismiss="modal">Return to Lobby</button>
							{gameMode === 'LOCAL' &&
								<button type="button" className="btn btn-secondary" onClick={() => location.reload()} data-bs-dismiss="modal">Play Again</button>
							}
						</div>
					</div>
				</div>
			</div>
			<div className="modal-backdrop fade show" />
		</>
	)
}