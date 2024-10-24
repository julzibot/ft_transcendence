"use client"
import { User } from '@/types/Auth';
import { useState, useEffect } from 'react'
import { BACKEND_URL } from '@/config';

export default function GameCountdownModal({ players }) {

	const [countdown, setCountdown] = useState<number>(3)


	useEffect(() => {
		const interval = setInterval(() => {
			if (countdown > 0)
				setCountdown(countdown - 1);
			else {
				console.log('Start the Game!');
				clearInterval(interval);
			}
		}, 1000);
		return () => {
			clearInterval(interval)
		}
	}, [countdown])

	return (
		<>
			<div className={`modal fade show d-block`} id="staticBackDrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1}>
				<div className={`modal-dialog modal-lg modal-dialog-centered`}>
					<div className={`modal-content`}>
						<div className="modal-body">
							<div className="d-flex justify-content-center align-items-center">
								<div className="justify-content-center col-6 d-flex align-items-center" style={{
									height: '100px'
								}}>
									<div className="d-flex flex-row align-items-center">
										< div className="me-3 position-relative border border-3 border-dark-subtle rounded-circle" style={{ width: '70px', height: '70px', overflow: 'hidden' }}>
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
												src={`${BACKEND_URL}${players.player1.image}`}
											/>
										</div>
										<span className="me-2 text-truncate fs-2" style={{ maxWidth: 'calc(80%)' }}>{players.player1.username}</span>
									</div>
								</div>
								<h2 className="pt-2">vs</h2>
								<div className="justify-content-center col-6 d-flex align-items-center"
								>
									<div className="d-flex flex-row align-items-center">
										<span className="me-2 text-truncate fs-2" style={{ maxWidth: 'calc(80%)' }}>{players.player2.username}</span>
										< div className="ms-2 position-relative border border-3 border-dark-subtle rounded-circle" style={{ width: '70px', height: '70px', overflow: 'hidden' }}>
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
												src={`${BACKEND_URL}${players.player2.image}`}
											/>
										</div>
									</div>
								</div>
							</div>
							<div className="d-flex flex-column justify-content-center align-items-center">
								<h5>Game starting in</h5>
								{countdown}
							</div>
						</div>
					</div>
				</div>
			</div >
			<div className="modal-backdrop fade show" />
		</>
	)
}