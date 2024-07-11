'use client';

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Customization from "@/components/game/Customization";
import LocalGame from "@/components/game/LocalGame";
import './styles.css'

export default function GameSettings() {

	const { data: session, status } = useSession();
	const [userId, setUserId] = useState(null);

	const [gameSettings, setGameSettings] = useState({
		user_id: userId,

		background: 0, // 0 - 3 animated, 4 - 5 static
		palette: 0, // palette: 4 choices
		bgColor: '#ff0000',
		opacity: 80,
		sparks: true,

		gameDifficulty: 4,
		pointsToWin: 5,
		powerUps: true
	});

	useEffect(() => {
		if (status === "authenticated" && session) {
			setUserId(session.user.id);
			setGameSettings({ ...gameSettings, user_id: session.user.id });
		}
	}, [session, status]);

	if (status === "Loading" || !userId) {
		return (
			<div class="d-flex justify-content-center">
				<div class="spinner-border" role="status">
					<span class="visually-hidden">Loading...</span>
				</div>
			</div>
		);
	}

	return (
		<>
			<div id="initialScreen" className=" m-3 h-100">
				<div className="container d-flex flex-column align-items-center justify-content-center h-100">
					<div className="card mt-1 mb-4 m-2 p-1 ps-4 pe-4">
						<div className="card-title">
							<h2 className="mt-3">Pong Game Settings</h2>
						</div>
					</div>

					<div className="card">
						<div className="card-body">

							<div className="d-flex flex-column align-items-center">

								<div className="m-2 mb-3">
									{
										userId ? (
											<Customization updateSettings={setGameSettings} gameSettings={gameSettings} userId={userId} />
										) : (
											<button class="btn btn-primary" type="button" disabled>
												<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
												<span role="status">Loading...</span>
											</button>)
									}
								</div>

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
							<LocalGame userId={userId} />
							{/* <div className="d-flex justify-content-center mb-3">
								<button type="button" className="btn btn-secondary mx-3">Play Against AI</button>
							</div>
							<div className="d-flex justify-content-center mb-3">
								<LocalMultiplayer remoteGame={false} userId={userId} />
							</div> */}
						</div>
					</div>
					<div className="m-3">
						<p>{JSON.stringify(gameSettings)}</p>
					</div>
				</div>
			</div>
		</>
	);
}
