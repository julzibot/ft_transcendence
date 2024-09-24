"use client";

import Lobby from "@/components/Lobby";
import { useAuth } from "@/app/lib/AuthContext";
import { useEffect, useState } from "react"
import Customization from "@/components/game/Customization";
import './styles.css'
import styles from './GameSettingsStyles.module.css'

export default function OnlineGamePage() {

	const { session } = useAuth();

	const [isTranslated, setIsTranslated] = useState(false);
	const [isMounted, setIsMounted] = useState(false);

	const [gameSettings, setGameSettings] = useState({
		user_id: session?.user?.id ?? -1,
		background: 0,
		palette: 0,
		bgColor: '#ff0000',
		opacity: 80,
		sparks: true,
		gameDifficulty: 4,
		pointsToWin: 5,
		powerUps: true
	});

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsMounted(true);
		}, 1000);
		return () => clearTimeout(timer)
	}, []);

	return (
		<>
			<div className="d-flex flex-column align-items-center justify-content-center">
				<div className={`card mt-1 mb-4 m-2 p-1 ps-4 pe-4 ${styles.pageTitle} ${isMounted ? styles.mounted : ''}`}>
					<div className="card-title">
						<h2 className="mt-3">Online Games</h2>
					</div>
				</div>
				{
					session?.user && <Customization updateSettings={setGameSettings} gameSettings={gameSettings} userId={session.user.id} />
				}
				<div className={`card mt-3 ${styles.gameSettingsCard} ${isTranslated ? styles.translated : ''} ${isMounted ? styles.mounted : ''}`}>
					<div className="card-body">
						{
							session && <Lobby setGameSettings={setGameSettings} gameSettings={gameSettings} />
						}
					</div>
				</div>
			</div>
		</>
	);
}