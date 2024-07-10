'use client';

import Link from "next/link"
import { useEffect, useState} from "react"
import "./styles.css"
import styles from './SimpleModeTranslations.module.css'
import { useRouter } from 'next/navigation'

export default function SimpleGamePage() {
  const [isMounted, setIsMounted] = useState<Boolean>(false);
	const [move, setMove] = useState<Boolean>(false);
	const router = useRouter()

	function moveLeft() {
		setMove(!move)
    const timer = setTimeout(() => {
      router.push('/game/local')
    }, 500);
	}

	function moveRight() {
		setMove(!move)
    const timer = setTimeout(() => {
      router.push('/game/online')
    }, 500);
	}


	useEffect(() => {
		setIsMounted(true)

		return(() => {
			setIsMounted(false)
		})
	})

  return (
		<>
			{/* Page Title */}
			<div className="d-flex justify-content-center">
				<div className={`card mt-3 ${styles.pageTitle} ${isMounted ? styles.mounted : ''} ${move ? styles.top : ''}`}>
						<h2 className="card-title m-1 p-2">Simple Game</h2>
				</div>
			</div>

			<div className="d-flex justify-content-evenly flex-row mt-5 pt-5">
				<div className={`card l-bg-green-dark p-4  ${styles.localCard} ${isMounted ? styles.mounted : ''} ${move ? styles.left : ''}`}>
					<Link role="button" href="#" style={{color: 'white', textDecoration: 'none'}} onClick={moveLeft}>
						<div className="card-body">
							<h1 className="card-title">Local</h1>
							<ul>
								<li>
									<span className="card-subtitle">Play Against AI</span>
								</li>
								<li>
									<span className="card-subtitle">Play Against Player</span>
								</li>
							</ul>
						</div>
					</Link>
				</div>

				<div className={`card l-bg-cherry px-5  ${styles.onlineCard} ${isMounted ? styles.mounted : ''} ${move ? styles.right : ''}`}>
					<Link role="button" href="/game/online" style={{color: 'white', textDecoration: 'none'}} onClick={moveRight}>
						<div className="card-statistic-3 p-4"></div>
							<h1 className="text-center">Online</h1>
							<ul>
								<li>
									<span className="card-subtitle">Create Game</span>
								</li>
								<li>
									<span className="card-subtitle">Join Game</span>
								</li>
							</ul>
					</Link>
				</div>
			</div>
		</>
  )
}
