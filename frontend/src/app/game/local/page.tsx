'use client';

import Join from "../../../components/game/Join"
import { useSession } from "next-auth/react"
import { useEffect, useState, useContext } from "react"
import Link from "next/link"
import { SocketContext, socket } from "../../../../context/socket"
import ColorSliderPicker from '../../../components/game/ColorPalette'

export default function GameSettings() {

	// const [gameSetup, setGameSetup] = useState(false);
  const { data: session, status } = useSession();
	const [userId, setUserId] = useState(null);

	// Showing components
	const [showSettings, setShowSettings] = useState(true);

	const [gameSettings, setGameSettings] = useState({
		userId: -1,
		bgPattern: 'animated',
		animatedBg: 1,
		staticBg: 1,
		colorStyle: false,
		bgColor: '#ff0000',
		opacity: 0,
		sparks: true,
		gameDifficulty: 1,
		points: 3,
		powerUps: true
	});

	useEffect(() => {
		localStorage.setItem("gameSettings", JSON.stringify(gameSettings));
		console.log('SETTING game settings');
	}, [gameSettings]);
	
	useEffect(() => {
		if (status === "authenticated" && session) {
			setUserId(session.user.id);
			setGameSettings({ ...gameSettings, 'userId': session.user.id });
			console.log('UserId set: ' + session.user.id);
			console.log(gameSettings);
		}
	}, [session, status]);

	if (status === "Loading" || !userId) {
		return (
			<div>Loading...</div>
		);
	}

	const handleColorChange = (color) => {
    console.log('Selected color:', color.hex);
  };

  return (
    <>
      {showSettings && (
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
                    onChange={() => setGameSettings({ ...gameSettings, bgPattern: 'animated' })}
                    checked={gameSettings.bgPattern === 'animated'}
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
                    id="flexRadioDefault2"
                    value="static"
                    onChange={() => setGameSettings({ ...gameSettings, bgPattern: 'static' })}
                    checked={gameSettings.bgPattern === 'static'}
                  />
                  <label className="form-check-label" htmlFor="flexRadioDefault2">
                    Static Background
                  </label>
                </div>
              </div>

              {gameSettings.bgPattern === 'animated' && (
                <>
                  <div className="mb-3">
                    <select
                      className="form-select"
                      aria-label="Animated Background"
                      value={gameSettings.animatedBg}
                      onChange={(e) => setGameSettings({ ...gameSettings, animatedBg: e.target.value })}
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
                        checked={gameSettings.colorStyle}
                        onChange={() => setGameSettings({ ...gameSettings, colorStyle: !gameSettings.colorStyle })}
                      />
                    </div>
                    <div className="form-text mb-0 ml-3">Palette</div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="favcolor" className="form-label">Select your favorite color</label>
                    <div className="container d-flex align-items-center justify-content-center">
											{/* <input
												type="color"
												id="favcolor"
												value={gameSettings.bgColor}
												onChange={(e) => setGameSettings({ ...gameSettings, bgColor: e.target.value })}
												className="form-control form-control-color"
												title="Choose your color"
												/> */}
												<ColorSliderPicker defaultColor="#00f" onChange={handleColorChange} />
											</div>
                  </div>
                </>
              )}

              {gameSettings.bgPattern === 'static' && (
                <div className="mb-3">
                  <select
                    className="form-select"
                    aria-label="Static Background"
                    value={gameSettings.staticBg}
                    onChange={(e) => setGameSettings({ ...gameSettings, staticBg: e.target.value })}
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
                  value={gameSettings.opacity}
                  onChange={(e) => setGameSettings({ ...gameSettings, opacity: e.target.value })}
                />
              </div>

              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="flexSwitchCheckDefault"
                  checked={gameSettings.sparks}
                  onChange={() => setGameSettings({ ...gameSettings, sparks: !gameSettings.sparks })}
                />
                <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Collision Sparks</label>
              </div>

              <div className="mb-3">
							<label htmlFor="gameDifficulty" className="form-label">Game Difficulty</label>
                <select
                  className="form-select"
                  aria-label="Game Difficulty"
                  value={gameSettings.gameDifficulty}
                  onChange={(e) => setGameSettings({ ...gameSettings, gameDifficulty: e.target.value })}
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
                <label htmlFor="customRange3" className="form-label">Points to Win</label>
                <input
                  type="range"
                  className="form-range"
                  min="1"
                  max="21"
                  step="1"
                  id="customRange3"
                  value={gameSettings.points}
                  onChange={(e) => setGameSettings({ ...gameSettings, points: e.target.value })}
                />
								<div className="container d-flex align-items-center justify-content-center">
									<p><strong>{gameSettings.points}</strong></p>
								</div>
              </div>

              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="flexSwitchCheckChecked"
                  checked={gameSettings.powerUps}
                  onChange={() => setGameSettings({ ...gameSettings, powerUps: !gameSettings.powerUps })}
                />
                <label className="form-check-label" htmlFor="flexSwitchCheckChecked">Power-ups</label>
              </div>

              <div className="d-flex justify-content-center mb-3">
                <button type="button" className="btn btn-secondary mx-3">Play Against AI</button>
              </div>

							<p>{JSON.stringify(gameSettings)}</p>
            </div>
            <Link href='/game/local/play/'>
              <button type="button" className="btn btn-secondary mx-3">Local Multiplayer</button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
