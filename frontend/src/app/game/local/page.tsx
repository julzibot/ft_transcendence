'use client';

import ThreeScene from "../../../components/game/Game"
import Join from "../../../components/game/Join"
import { useSession } from "next-auth/react"
import { useEffect, useState, useContext } from "react"
import io from "socket.io-client"
import { SocketContext, socket } from "../../../../context/socket"
import './custom.scss'

export default function Play() {

	const [gameSetup, setGameSetup] = useState(false);
  const { data: session, status } = useSession();
	const [userId, setUserId] = useState(null);

	// Showing components
	const [showSettings, setShowSettings] = useState(true);

	// Game customization variables
	const [bgPattern, setBgPattern] = useState('animated');
	const [animatedBg, setAnimatedBg] = useState(1);
	const [staticBg, setStaticBg] = useState(1);
	const [color, setColor] = useState(false);
	const [bgColor, setBgColor] = useState('#ff0000');
	const [opacity, setOpacity] = useState(0);
	const [sparks, setSparks] = useState(false);
	const [gameDifficulty, setGameDifficulty] = useState(1); // 1-7
	const [points, setPoints] = useState(3); // 1-15
	const [powerUps, setPowerUps] = useState(false);
	const [validSettings, setValidSettings] = useState(false);

	let gameSettings = {
		gameDifficulty: 1,
		pointsToWin: 3,
		powerUps: true
	}
	
	useEffect(() => {
		if (status === "authenticated" && session) {
			setUserId(session.user.id);
		}
	}, [session, status]);
	
		useEffect(() => {
			gameSettings['gameDifficulty'] = gameDifficulty;
			gameSettings['pointsToWin'] = points;
			gameSettings['powerUps'] = powerUps;
			console.log('Updating Game Settings: ' + JSON.stringify(gameSettings));
			if (gameDifficulty >= 1 && gameDifficulty <= 7 && points >= 1 && points <= 15 &&
				(powerUps == true || powerUps == false))
				setValidSettings(true);
			else
				setValidSettings(false);
		}, [gameDifficulty, points, powerUps]);

	if (status === "Loading" || !userId) {
		return (
			<div>Loading...</div>
		);
	}

	const handleBgPattern = (event) => {
		setBgPattern(event.target.value);
	};

	const handleAnimBg = (event) => {
		setAnimatedBg(event.target.value);
	}

	const handleStaticBg = (event) => {
		setStaticBg(event.target.value);
	}

	const handleColor = () => {
		setColor(prevClr => !prevClr);
	}

	const handleBgColor = (event) => {
		setBgColor(event.target.value);
	}

	const handleOpacity = (event) => {
		setOpacity(event.target.value);
	}

	const handleSparks = () => {
		setSparks(prevSparks => !prevSparks);
	}

	const handleGameDifficulty = (event) => {
		setGameDifficulty(event.target.value);
	}

	const handlePoints = (event) => {
		setPoints(event.target.value);
	}

	const handlePowerUps = () => {
		setPowerUps(prevState => !prevState);
	}

	const handleJoinBtn = () => {
		if (validSettings) {
			setShowSettings(false);
			setGameSetup(true);
		}
		else
			console.log('Invalid Game Settings')
	}

  return (
    <>
		{
			showSettings && 
        <div id="initialScreen" className="h-100">
				<div className="container d-flex flex-column align-items-center justify-content-center h-100">
						<h2 className="mt-3">Pong Game Settings</h2>

						<div className="d-flex flex-column align-items-center">
								<div className="mb-3">
										<div className="form-check">
												<input
														className="form-check-input"
														type="radio"
														name="flexRadioDefault"
														id="flexRadioDefault1"
														value="animated"
														onChange={handleBgPattern}
														checked={bgPattern === 'animated'}
												/>
												<label className="form-check-label" htmlFor="flexRadioDefault1">
														Animated Background
												</label>
										</div>
										<div className="form-check">
												<input
														className="form-check-input"
														type="radio"
														name="flexRadioDefault"
														value="static"
														onChange={handleBgPattern}
														id="flexRadioDefault2"
														checked={bgPattern === 'static'}
												/>
												<label className="form-check-label" htmlFor="flexRadioDefault2">
														Static Background
												</label>
										</div>
								</div>

								{bgPattern === 'animated' && (
										<>
												<div className="mb-3">
														<select
																className="form-select"
																aria-label="Animated Background"
																value={animatedBg}
																onChange={handleAnimBg}
														>
															<option value="">Select Animated Background</option>
															<option value="1">Default</option>
															<option value="2">Lightsquares</option>
															<option value="3">Waves</option>
															<option value="4">Fractcircles</option>
														</select>
												</div>

												<div className="d-flex align-items-center mb-3">
														<div className="form-text mb-0 mr-3">Single</div>
														<div className="form-check form-switch mb-0">
																<input
																		className="form-check-input"
																		type="checkbox"
																		role="switch"
																		id="flexSwitchCheckDefault"
																		checked={color}
																		onChange={handleColor}
																/>
														</div>
														<div className="form-text mb-0 ml-3">Palette</div>
												</div>

												<div className="mb-3">
														<label htmlFor="favcolor" className="form-label">Select your favorite color</label>
														<input
																type="color"
																id="favcolor"
																value={bgColor}
																onChange={handleBgColor}
																className="form-control form-control-color"
																title="Choose your color"
														/>
												</div>
										</>
								)}

								{bgPattern === 'static' && (
										<div className="mb-3">
												<select
														className="form-select"
														aria-label="Static Background"
														value={staticBg}
														onChange={handleStaticBg}
												>
														<option value="">Select Static Background</option>
														<option value="1">Snow</option>
														<option value="2">City</option>
												</select>
										</div>
								)}

								<div className="mb-3">
										<label htmlFor="bgOpacity" className="form-label">Background Opacity (0-100)</label>
										<input
												type="range"
												className="form-range"
												min="0"
												max="100"
												step="1"
												id="bgOpacity"
												value={opacity}
												onChange={handleOpacity}
										/>
								</div>

								<div className="form-check form-switch mb-3">
										<input
												className="form-check-input"
												type="checkbox"
												role="switch"
												id="flexSwitchCheckDefault"
												checked={sparks}
												onChange={handleSparks}
										/>
										<label className="form-check-label" htmlFor="flexSwitchCheckDefault">Collision Sparks</label>
								</div>

								<div className="mb-3">
										<select
												className="form-select"
												aria-label="Game Difficulty"
												value={gameDifficulty}
												onChange={handleGameDifficulty}
										>
												<option value="">Select Game Difficulty</option>
												<option value="1">Granny</option>
												<option value="2">Boring</option>
												<option value="3">Still Slow</option>
												<option value="4">Kinda OK</option>
												<option value="5">Now We're Talking</option>
												<option value="6">Madman</option>
												<option value="7">Legend</option>
										</select>
								</div>

								<div className="mb-3">
										<label htmlFor="customRange3" className="form-label">Points to Win (1-21)</label>
										<input
												type="range"
												className="form-range"
												min="1"
												max="21"
												step="1"
												id="customRange3"
												value={points}
												onChange={handlePoints}
										/>
								</div>

								<div className="form-check form-switch mb-3">
										<input
												className="form-check-input"
												type="checkbox"
												role="switch"
												id="flexSwitchCheckChecked"
												checked={powerUps}
												onChange={handlePowerUps}
										/>
										<label className="form-check-label" htmlFor="flexSwitchCheckChecked">Power-ups</label>
								</div>

								<div className="d-flex justify-content-center mb-3">
										<button type="button" className="btn btn-secondary mx-3">Play Against AI</button>
										<button type="button" className="btn btn-secondary mx-3">Local Multiplayer</button>
								</div>

								{/* <p>BG pattern: {bgPattern}</p>
								<p>Anim BG: {animatedBg}</p>
								<p>Static BG: {staticBg}</p>
								<p>Color: {color}</p>
								<p>BG color: {bgColor}</p>
								<p>Opacity: {opacity}</p>
								<p>Sparks: {sparks.toString()}</p>
								<p>Game Difficulty: {gameDifficulty}</p>
								<p>Points: {points}</p>
								<p>PowerUps: {powerUps.toString()}</p> */}
						</div>
				<button className="btn btn-primary" onClick={handleJoinBtn}>Join a game</button>
				</div>
		</div>
		}
		{gameSetup &&
		<>
			<SocketContext.Provider value={socket}>
				<Join user_id={userId} gameSettings={gameSettings} />
			</SocketContext.Provider>
		</>
		}

    </>
  )
}
