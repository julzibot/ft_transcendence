'use client';

import { useEffect, useState } from "react"
import Customization from "@/components/game/Customization";
import './styles.css'
import styles from './GameSettingsStyles.module.css'
import { useRouter } from 'next/navigation';



export default function LocalGame() {

	const router = useRouter();

	const [isTranslated, setIsTranslated] = useState(false);
	const [isMounted, setIsMounted] = useState(false);

	const [gameSettings, setGameSettings] = useState({
		game_difficulty: 3,
		points_to_win: 11,
		power_ups: true
	});

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const settings = localStorage.getItem("gameSettings");
			if (settings) {
				const parsedSettings = JSON.parse(settings);
				setGameSettings(parsedSettings.gameSettings);
			}
		}
		const timer = setTimeout(() => {
			setIsMounted(true);
			setIsTranslated(true);
		}, 500);
		return () => clearTimeout(timer)
	}, []);

	const handleClick = (gameMode: 'ai' | 'local') => {
		const localProps = {
			gameMode: gameMode === 'ai' ? 1 : 0,
			gameSettings: gameSettings
		}
		if (typeof window !== 'undefined') {
			localStorage.setItem("gameSettings", JSON.stringify(localProps));
		}
		router.replace("/game/local/play");
	}

	return (
		<div className="d-flex flex-column align-items-center justify-content-center">
			<div className={`card mt-1 m-2 p-1 ps-4 pe-4 ${styles.pageTitle} ${isMounted ? styles.mounted : ''}`}>
				<div className="card-title">
					<h2 className="mt-3">Pong Game Settings</h2>
				</div>
			</div>
			<Customization />
			<div className={`card ${styles.gameSettingsCard} ${isTranslated ? styles.translated : ''} ${isMounted ? styles.mounted : ''}`}>
				<div className="card-body">

					<div className="d-flex flex-column align-items-center">

						<div className="mb-3 text-center">
							<label htmlFor="game_difficulty" className="form-label">Game Difficulty</label>
							<select
								className="form-select"
								aria-label="Game Difficulty"
								value={gameSettings.game_difficulty}
								onChange={(e) =>
									setGameSettings({ ...gameSettings, game_difficulty: parseInt(e.target.value) })
								}
							>
								<option value="">Select Game Difficulty</option>
								<option value={1}>Granny</option>
								<option value={2}>Boring</option>
								<option value={3}>Still Slow</option>
								<option value={4}>Kinda OK</option>
								<option value={5}>Now We are Talking</option>
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
								value={gameSettings.points_to_win}
								onChange={(e) => setGameSettings({ ...gameSettings, points_to_win: parseInt(e.target.value) })}
							/>
							<div className="d-flex align-items-center justify-content-center">
								<p><strong>{gameSettings.points_to_win}</strong></p>
							</div>
						</div>

						<div className="form-check form-switch mb-3">
							<input
								className="form-check-input"
								type="checkbox"
								role="switch"
								id="flexSwitchCheckChecked"
								checked={gameSettings.power_ups}
								onChange={() =>
									setGameSettings({ ...gameSettings, power_ups: !gameSettings.power_ups })
								}
							/>
							<label className="form-check-label" htmlFor="flexSwitchCheckChecked">Power-ups</label>
						</div>
					</div>
					<div className="d-flex justify-content-center mb-3">
						<button type="button" className="btn btn-secondary mx-3" onClick={() => handleClick('ai')}>Play Against AI</button >
					</div >
					<div className="d-flex justify-content-center mb-3">
						<button type="button" className="btn btn-secondary mx-3" onClick={() => handleClick('local')}>Local Multiplayer</button>
					</div>
				</div>
			</div>
		</div>
	);
}