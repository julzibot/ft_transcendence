"use client"
import { Spinner } from 'react-bootstrap';
import Image from '../Utils/Image';
import { useEffect } from 'react'
import useSocketContext from '@/context/socket';
import { count } from 'console';


interface Player {
	id: number,
  username: string,
  image: string
}

interface ModalProps {
	players: {
		player1: Player | null,
    player2: Player | null
  }
	countdown: number,
	setCountdown: Function,
	game_id: number | undefined
}

export default function LobbyModal({players, countdown, setCountdown, game_id} : ModalProps) {
	const socket = useSocketContext();	

	useEffect(() => {
		const interval = setInterval(() => {
			if (countdown === 1)
				socket?.emit('joinGame', { gameId: game_id })
			if (countdown > 0)
				setCountdown(countdown - 1);
			else {
				clearInterval(interval);
			}
		}, 1000);
		return () => {
			clearInterval(interval)
		}
	}, [countdown])


  if((!players.player1 || !players.player2) && game_id === undefined) {
    return(
      <>
			<div className="modal fade show d-block">
				<div className="modal-dialog modal-lg modal-dialog-centered">
					<div className="modal-content">
						<div className="modal-body">
							<div className="d-flex justify-content-center align-items-center">
							{players.player1 ? (
									<div className="justify-content-center col-6 d-flex align-items-center">
										<div className="d-flex flex-row align-items-center">
											<span className="me-2 text-truncate fs-2" style={{ maxWidth: 'calc(80%)' }}>{players.player1.username}</span>
											<Image className="ms-2" src={players.player1.image} alt="profile picture" whRatio="70px" />
										</div>
									</div>
								) : (
									<>
										<div className="justify-content-center border col d-flex align-items-center">
											<div className="d-flex flex-row align-items-center">
												<span className="me-4 text-truncate fs-2" style={{ maxWidth: 'calc(80%)' }}>[player]</span>
													<Spinner className="border-dark-subtle border-2" animation="border" style={{ width: '100px', height: '100px', borderRight: "none", borderLeft: "none", borderBottom: "none", animationDuration: "1.2s" }} />
											</div>
										</div>
									</>
								)}
								<h2 className="pt-2">vs</h2>
								{players.player2 ? (
									<div className="justify-content-center col-6 d-flex align-items-center">
										<div className="d-flex flex-row align-items-center">
											<span className="me-2 text-truncate fs-2" style={{ maxWidth: 'calc(80%)' }}>{players.player2.username}</span>
											<Image className="ms-2" src={players.player2.image} alt="profile picture" whRatio="70px" />
										</div>
									</div>
								) : (
									<>
										<div className="justify-content-center border col d-flex align-items-center">
											<div className="d-flex flex-row align-items-center">
												<span className="me-4 text-truncate fs-2" style={{ maxWidth: 'calc(80%)' }}>[player]</span>
													<Spinner className="border-dark-subtle border-2" animation="border" style={{ width: '100px', height: '100px', borderRight: "none", borderLeft: "none", borderBottom: "none", animationDuration: "1.2s" }} />
											</div>
										</div>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div >
		</>
    )
  }
	else if(players.player2 && players.player1) {
		return (
			<>
			<div className={`modal fade show d-block`}>
				<div className={`modal-dialog modal-lg modal-dialog-centered`}>
					<div className={`modal-content`}>
						<div className="modal-body">
							<div className="d-flex justify-content-center align-items-center">
								<div className="justify-content-center col-6 d-flex align-items-center" style={{
									height: '100px'
								}}>
									<div className="d-flex flex-row align-items-center">
										<Image className="me-3" src={players.player1.image} alt="profile picture" whRatio="70px" />
										<span className="me-2 text-truncate fs-2" style={{ maxWidth: 'calc(80%)' }}>{players.player1.username}</span>
									</div>
								</div>
								<h2 className="pt-2">vs</h2>
								<div className="justify-content-center col-6 d-flex align-items-center"
								>
									<div className="d-flex flex-row align-items-center">
										<span className="me-2 text-truncate fs-2" style={{ maxWidth: 'calc(80%)' }}>{players.player2.username}</span>
										<Image src={players.player2.image} alt="profile picture" whRatio="70px" />
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
	else if (countdown === 0) {
		return null
	}
}