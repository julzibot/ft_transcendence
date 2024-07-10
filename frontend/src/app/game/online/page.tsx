'use client';

import Link from "next/link"
import Join from "../../../components/game/Join"
import { useSession } from "next-auth/react"
import { useEffect, useState, useContext} from "react"
import io from "socket.io-client"
import { SocketContext, socket } from "../../../../context/socket"
import "./styles.css"
import styles from './OnlineModeTranslations.module.css'

export default function GameMain() {

	const [isTranslated, setIsTranslated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true)
	})
  return (
		<>
			{/* Page Title */}
			<div className="d-flex justify-content-center">
				<div className={`card ${styles.pageTitle} ${isMounted ? styles.mounted : ''}`}>
						<h2 className="card-title m-1 p-2">Online Mode</h2>
				</div>
			</div>

			<div className="d-flex align-items-stretch justify-content-evenly flex-row mt-5 pt-5">
				<div className={`card l-bg-green-dark p-4  ${styles.singleCard} ${isMounted ? styles.mounted : ''}`}>
					<h5 className="card-title">1 VS 1</h5>
					<div className="card-body text-center">
						<div className="input-group mt-2">
							<input type="text" className="form-control shadow-none rounded" placeholder="Enter Game ID" aria-label="Join Online Game" aria-describedby="button-addon2" />
							<Link href="game/local">
								<button className="btn btn-info ms-1" type="button" id="button-addon2">Join Game</button>
							</Link>
						</div>
						<h5 className="card-subtitle m-2">or</h5>
						<Link href="game/online/create_game">
							<button className="btn btn-warning">Create Game</button>
						</Link>
					</div>
				</div>

				<div className={`card l-bg-cherry px-5  ${styles.tournamentCard} ${isMounted ? styles.mounted : ''}`}>
					<Link href="/tournaments" style={{color: 'white', textDecoration: 'none'}}>
						<div className="card-statistic-3 p-4"></div>
						<h5 className="card-title mb-4">Multiplayer Mode</h5>
						<h2 className="text-center">Create Tournament</h2>
					</Link>
				</div>
			</div>
		</>
  )
}
