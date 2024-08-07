"use client";

import Lobby from "@/components/Lobby";
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Customization from "@/components/game/Customization";
import './styles.css'
import styles from './GameSettingsStyles.module.css'

export default function OnlineGamePage() {

	const { data: session, status } = useSession();

	const [isTranslated, setIsTranslated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);


	const [gameSettings, setGameSettings] = useState({
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
				<div className="container d-flex flex-column align-items-center justify-content-center">
					<div className={`card mt-1 mb-4 m-2 p-1 ps-4 pe-4 ${styles.pageTitle} ${isMounted ? styles.mounted : ''}`}>
						<div className="card-title">
							<h2 className="mt-3">Pong Game Settings</h2>
						</div>
					</div>
					{
						session && <Customization updateSettings={setGameSettings} gameSettings={gameSettings} userId={session.user.id} />
					}
					<div className={`card ${styles.gameSettingsCard} ${isTranslated ? styles.translated : ''} ${isMounted ? styles.mounted : ''}`}>
						<div className="card-body">

							<div className="d-flex flex-column align-items-center">


								<div className="mb-3 text-center">
									<label htmlFor="gameDifficulty" className="form-label">Game Difficulty</label>
									<select
										className="form-select"
										aria-label="Game Difficulty"
										value={gameSettings.gameDifficulty}
										onChange={(e) =>
											setGameSettings({ ...gameSettings, gameDifficulty: parseInt(e.target.value) })
										}
									>
										<option value="">Select Game Difficulty</option>
										<option value={1}>Granny</option>
										<option value={2}>Boring</option>
										<option value={3}>Still Slow</option>
										<option value={4}>Kinda OK</option>
										<option value={5}>Now We're Talking</option>
										<option value={6}>Madman</option>
										<option value={7}>Legend</option>
									</select>
								</div>

								<div className="mb-1 text-center">
									<div>
										<label htmlFor="pointsRange" className="form-label">Points to Win</label>
									</div>
									<input
										type="range"
										className="form-range"
										min="1"
										max="21"
										step="1"
										id="pointsRange"
										value={gameSettings.pointsToWin}
										onChange={(e) => setGameSettings({ ...gameSettings, pointsToWin: parseInt(e.target.value) })}
									/>
									<div className="container d-flex align-items-center justify-content-center">
										<p><strong>{gameSettings.pointsToWin}</strong></p>
									</div>
								</div>

								<div className="form-check form-switch mb-3">
									<input
										className="form-check-input"
										type="checkbox"
										role="switch"
										id="flexSwitchCheckChecked"
										checked={gameSettings.powerUps}
										onChange={() =>
											setGameSettings({ ...gameSettings, powerUps: !gameSettings.powerUps })
										}
									/>
									<label className="form-check-label" htmlFor="flexSwitchCheckChecked">Power-ups</label>
								</div>


							</div>
							{
								session && <Lobby />
							}
						</div>
					</div>
				</div>
		</>
	);
}