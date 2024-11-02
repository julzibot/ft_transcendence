"use client"
import { useEffect } from 'react'
import useSocketContext from '@/context/socket';
import Image from '../Utils/Image';
import { NumberKeyframeTrack } from 'three';
import { useAuth } from '@/app/lib/AuthContext';

export default function GameCountdownModal({ lobby_id, game_id, players, countdown, setCountdown }: { lobby_id: string | string[], game_id: number, players: {}, countdown: number, setCountdown: Function }) {

	const socket = useSocketContext();
	const { session } = useAuth();

	if (!session)
		return;

	useEffect(() => {
		const interval = setInterval(() => {
			if (countdown === 1)
				socket?.emit('joinGame', { userId: session?.user?.id, gameId: game_id, lobbyId: lobby_id })
			if (countdown > 0)
				setCountdown(countdown - 1);
			else
				clearInterval(interval);
		}, 1000);
		return () => {
			clearInterval(interval)
		}
	}, [countdown])

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