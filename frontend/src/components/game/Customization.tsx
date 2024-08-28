'use client'

import { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import styles from './CustomizationStyles.module.css';
import './colorPickerStyles.css';
import { GameSetings } from "@/types/GameSettings";

export async function fetchGameSettings(user_id: number, updateSettings: Function, gameSettings: GameSetings) {

	if (user_id) {
		const response = await fetch(`http://localhost:8000/api/gameCustomization/${user_id}`, {
			method: 'GET'
		});
		if (response.ok) {
			if (response.status === 204) {
				updateSettings({
					...gameSettings,
					user_id: user_id,
					background: 0,
					palette: 0,
					bgColor: '#ff0000',
					opacity: 80,
					sparks: true,
				})
			} else {
				const fetched = await response.json();
				const data = fetched.data;
				updateSettings({
					...gameSettings,
					user_id: user_id,
					background: data.background,
					palette: data.palette,
					bgColor: data.bgColor,
					opacity: data.opacity,
					sparks: data.sparks
				});
			}
		} else if (response.status === 404) {
			console.error('[Fetch Game Settings] [404] - User Does Not Exist');
			updateSettings({
				...gameSettings,
				user_id: user_id,
				background: 0,
				palette: 0,
				bgColor: '#ff0000',
				opacity: 80,
				sparks: true,
			})
		} else {
			console.error('[Fetch Game Settings] Error: ' + response.status);
			updateSettings({
				...gameSettings,
				user_id: user_id,
				background: 0,
				palette: 0,
				bgColor: '#ff0000',
				opacity: 80,
				sparks: true,
			})
		}
	}
};

interface GameSettingsProps {
	updateSettings: Function,
	gameSettings: GameSetings,
	userId: number
}

export default function Customization({ updateSettings, gameSettings, userId }: GameSettingsProps) {

	const [palette, setPalette] = useState(false);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		fetchGameSettings(userId, updateSettings, gameSettings);
		const timer = setTimeout(() => {
			setIsMounted(true);
		}, 50);
		return () => clearTimeout(timer)
	}, [userId]);

	const handleColorChange = (color: string) => {
		updateSettings({ ...gameSettings, bgColor: color });
	};

	const handlePalette = () => {
		if (palette)
			updateSettings({ ...gameSettings, palette: 0 });
		else if (!palette)
			updateSettings({ ...gameSettings, palette: 1 });
		setPalette((prevPalette) => !prevPalette);
	}

	const handlePaletteRadio = (e: React.ChangeEvent<HTMLInputElement>) => {
		updateSettings({ ...gameSettings, palette: parseInt(e.target.value) });
	}

	const gameCustomDefault = () => {
		updateSettings({
			...gameSettings,
			background: 0,
			palette: 0,
			bgColor: '#ff0000',
			opacity: 80,
			sparks: true
		});
		gameCustomSave();
	}

	const gameCustomSave = async () => {
		// console.log(gameSettings);
		const requestData = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(gameSettings)
		};
		const response = await fetch('http://localhost:8000/api/gameCustomization/', requestData);
		const data = await response.json();
	}

	return (
		<>
			<div className="offcanvas offcanvas-start" tabIndex={-1} id="offcanvasCustomization" aria-labelledby="offcanvasExampleLabel">
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
									onChange={() => updateSettings({ ...gameSettings, background: 0 })}
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
									onChange={() => updateSettings({ ...gameSettings, background: 4 })}
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
											updateSettings({ ...gameSettings, background: parseInt(e.target.value) })
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
										<div className="align-items-center justify-content-center">
											<HexColorPicker
												color="#00f"
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
												<img src='/palette/palette_1.png' width="220" height="60" alt="palette 1" />
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
												<img src='/palette/palette_2.png' width="220" height="60" alt="palette 2" />
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
												<img src='/palette/palette_3.png' width="220" height="60" alt="palette 3" />
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
												<img src='/palette/palette_4.png' width="220" height="60" alt="palette 4" />
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
										updateSettings({ ...gameSettings, background: parseInt(e.target.value) })
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
								onChange={(e) => updateSettings({ ...gameSettings, opacity: parseInt(e.target.value) })}
							/>
							<div className="mb-1">
								<p>{gameSettings.opacity}%</p>
							</div>

							<div className="form-check form-switch mb-3">
								<input
									className="form-check-input"
									type="checkbox"
									role="switch"
									id="flexSwitchCheckDefault"
									checked={gameSettings.sparks}
									onChange={() =>
										updateSettings({ ...gameSettings, sparks: !gameSettings.sparks })
									}
								/>
								<label className="form-check-label" htmlFor="flexSwitchCheckDefault">Collision Sparks</label>
							</div>

							<div>
								<button className="m-1 btn btn-warning" data-bs-dismiss="offcanvas" onClick={gameCustomSave}>Save</button>
								<button className="m-1 btn btn-primary" onClick={gameCustomDefault}>Reset to Default</button>
							</div>

						</div>

					</div>
				</div>
			</div>

			<div className="d-flex flex-column align-items-center">

				<div className="m-2">
					<button className={`btn btn-primary rounded-pill ${styles.button} ${isMounted ? styles.mounted : ''}`}
						type="button"
						data-bs-toggle="offcanvas"
						data-bs-target="#offcanvasCustomization"
						aria-controls="offcanvasCustomization">
						Game Customization
					</button>
				</div>
			</div>
		</>
	)
}