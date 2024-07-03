'use client';

import Join from "../../../components/game/Join"
import { useSession } from "next-auth/react"
import { useEffect, useState, useContext } from "react"
import Link from "next/link"
import { SocketContext, socket } from "../../../../context/socket"
import ColorSliderPicker from '../../../components/game/ColorPalette'
import './styles.css'

export default function GameSettings() {

  const { data: session, status } = useSession();
	const [userId, setUserId] = useState(null);
	const [palette, setPalette] = useState(false);

	const [gameSettings, setGameSettings] = useState({
		userId: -1,
		background: 0, // 0 - 3 animated, 4 - 5 static
		
		palette: 0, // palette: 4 choices
		bgColor: '#ff0000',
		
		opacity: 80,
		sparks: true,
		gameDifficulty: 1,
		pointsToWin: 3,
		powerUps: true
	});
	
	useEffect(() => {
		localStorage.setItem("gameSettings", JSON.stringify(gameSettings));
	}, [gameSettings]);
	
	useEffect(() => {
		if (status === "authenticated" && session) {
			setUserId(session.user.id);
			setGameSettings({ ...gameSettings, 'userId': session.user.id });
		}
	}, [session, status]);

	// useEffect(() => {

	// 	const fetchGameSettings = async () => {
	// 		if (userId) {
	// 			const response = await fetch(`http://localhost:8000/api/gameCustomization/${userId}`, {
	// 				method: 'GET'
	// 			});
	// 			if (response.ok) {
	// 				const data = await response.json();
	// 				setGameSettings({...gameSettings, background: data.background,
	// 					palette: data.palette, bgColor: data.bgColor, opacity: data.opacity, sparks: data.sparks})
	// 			}
	// 		}
	// 	};
	// 	fetchGameSettings()
	// }), [userId];

	if (status === "Loading" || !userId) {
		return (
			<div>Loading...</div>
		);
	}

	const handleColorChange = (color) => {
		setGameSettings({ ...gameSettings, 'bgColor': color.hex });
  };

	const handlePalette = () => {
		if (palette)
			setGameSettings({...gameSettings, palette: 0});
		else if (!palette)
			setGameSettings({...gameSettings, palette: 1});
		setPalette((prevPalette) => !prevPalette);
	}

	const handlePaletteRadio = (e) => {
		setGameSettings({ ...gameSettings, palette: parseInt(e.target.value) });
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

				<div className="offcanvas offcanvas-start" tabindex="-1" id="offcanvasCustomization" aria-labelledby="offcanvasExampleLabel">
					<div className="offcanvas-header">
						<h5 className="offcanvas-title" id="offcanvasExampleLabel">Game Customization</h5>
						<button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
					</div>
					<div className="offcanvas-body">
						<div className="d-flex flex-column align-items-center justify-content-center">
							<div className="mb-3">
         	  		<div className="form-check">
              	<input
									className="form-check-input"
									type="radio"
									name="bgRadio"
									id="flexRadioDefault1"
									value={0}
									onChange={() => setGameSettings({ ...gameSettings, background: 0 })}
									checked={(gameSettings.background >= 0 && gameSettings.background <= 3)}
								/>
              <label className="form-check-label" htmlFor="flexRadioDefault1">
                Animated Background
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="bgRadio"
                id="flexRadioDefault2"
                value={4}
                onChange={() => setGameSettings({ ...gameSettings, background: 4 })}
                checked={(gameSettings.background === 4 || gameSettings.background === 5)}
								/>
              <label className="form-check-label" htmlFor="flexRadioDefault2">
                Static Background
              </label>
            </div>
          </div>

          {(gameSettings.background >= 0 && gameSettings.background <= 3) && (
						<>
              <div className="mb-3">
                <select
                  className="form-select"
                  aria-label="Animated Background"
                  value={gameSettings.background}
                  onChange={(e) =>
                    setGameSettings({ ...gameSettings, background: parseInt(e.target.value) })
                  }
									>
                  <option value="">Select Animated Background</option>
                  <option value={0}>Default</option>
                  <option value={1}>Lightsquares</option>
                  <option value={2}>Waves</option>
                  <option value={3}>Fractcircles</option>
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
                    checked={palette}
                    onChange={handlePalette}
										/>
                </div>
                <div className="form-text mb-0 ml-3">Palette</div>
              </div>

							{!palette && 
              <div className="mb-3 text-center">
                <label htmlFor="favcolor" className="form-label">Select color</label>
                <div className="container align-items-center justify-content-center">
                  <ColorSliderPicker
                    defaultColor="#00f"
                    onChange={handleColorChange}
										/>
                </div>
              </div>}

							{palette && 
							<div className="mb-3">
								<div className="paletteButton">
									<input type="radio"
										className="btn-check"
										name="palette-options"
										value={1}
										id="palette1"
										autoComplete="off"
										checked={gameSettings.palette === 1}
										onChange={handlePaletteRadio}
									/>
									<label className="btn" htmlFor="palette1">
										<img src='/palette/palette_1.png' width="220" heigth="60" alt="palette 1" />
									</label>
								</div>
								<div className="paletteButton">
									<input type="radio"
										className="btn-check"
										name="palette-options"
										value={2}
										id="palette2"
										autoComplete="off"
										checked={gameSettings.palette === 2}
										onChange={handlePaletteRadio}
									/>
									<label className="btn" htmlFor="palette2">
										<img src='/palette/palette_2.png' width="220" heigth="60" alt="palette 2" />
									</label>
								</div>
								<div className="paletteButton">
									<input type="radio"
										className="btn-check"
										name="palette-options"
										value={3}
										id="palette3"
										autoComplete="off"
										checked={gameSettings.palette === 3}
										onChange={handlePaletteRadio}
									/>
									<label className="btn" htmlFor="palette3">
										<img src='/palette/palette_3.png' width="220" heigth="60" alt="palette 3" />
									</label>
								</div>
								<div className="paletteButton">
									<input type="radio"
										className="btn-check"
										name="palette-options"
										value={4}
										id="palette4"
										autoComplete="off"
										checked={gameSettings.palette === 4}
										onChange={handlePaletteRadio}
									/>
									<label className="btn" htmlFor="palette4">
										<img src='/palette/palette_4.png' width="220" heigth="60" alt="palette 4" />
									</label>
								</div>
							</div>
							}
            </>
          )}

          {(gameSettings.background === 4 || gameSettings.background === 5) && (
						<div className="mb-3">
              <select
                className="form-select"
                aria-label="Static Background"
                value={gameSettings.background}
                onChange={(e) =>
                  setGameSettings({ ...gameSettings, background: parseInt(e.target.value) })
                }
								>
                <option value="">Select Static Background</option>
                <option value={4}>Snow</option>
                <option value={5}>City</option>
              </select>
            </div>
          )}

          <div className="mb-3 text-center align-items-center">
						<div>
     	      	<label htmlFor="opacity" className="form-label">Backboard Opacity (0-100)</label>
							<div>
								<label htmlFor="opacity" className="form-label fst-italic" style={{ fontSize: '0.8em' }}>
									<small>recommended: 80%</small>
								</label>
							</div>
						</div>
            <input
              type="range"
              className="form-range"
              min="0"
              max="100"
              step="1"
              id="bgOpacity"
              value={gameSettings.opacity}
              onChange={(e) => setGameSettings({ ...gameSettings, opacity: parseInt(e.target.value) })}
							/>
						<div className="mb-1">
								<p>{gameSettings.opacity}%</p>
						</div>

       		</div>

				</div>
			</div>
		</div>

				<div className="card">
					<div className="card-body">

        <div className="d-flex flex-column align-items-center">

					<div className="m-2 mb-3">
						<button className="btn btn-primary"
							type="button"
							data-bs-toggle="offcanvas"
							data-bs-target="#offcanvasCustomization"
							aria-controls="offcanvasCustomization">
							Game Customization
						</button>
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

          <div className="d-flex justify-content-center mb-3">
            <button type="button" className="btn btn-secondary mx-3">Play Against AI</button>
          </div>

        </div>
				<div className="d-flex justify-content-center mb-3">
					<Link href='/game/local/play/'>
						<button type="button" className="btn btn-secondary mx-3">Local Multiplayer</button>
					</Link>
				</div>
      </div>
		</div>
		<p>{JSON.stringify(gameSettings)}</p>
	</div>
    </div>
	</>
  );
}
