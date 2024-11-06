'use client'

import { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import styles from './CustomizationStyles.module.css';
import './colorPickerStyles.css';
import { BACKEND_URL } from "@/config";
import Cookies from "js-cookie";
import { useAuth } from "@/app/lib/AuthContext";

export default function Customization() {
	const { session } = useAuth();

	const defaultSettings = {
		background: 0,
		palette: 0,
		bgColor: "#0000ff",
		opacity: 80,
		sparks: true
	}
	const [palette, setPalette] = useState(false);
	const [isMounted, setIsMounted] = useState(false);
	const [gameCustoms, setGameCustoms] = useState(defaultSettings);

	useEffect(() => {
		require("bootstrap/dist/js/bootstrap.bundle.min.js")
		async function fetchGameCustoms(id: number | undefined) {
			const response = await fetch(`${BACKEND_URL}/api/gameCustomization/${id}`, {
				method: 'GET',
				credentials: 'include',
			});
			if (response.ok) {
				const data = await response.json();
				setGameCustoms(data);
			}
		}
		if (session) {
			fetchGameCustoms(session?.user?.id);
			setIsMounted(true);
		}
	}, [session])

	const handleColorChange = (color: string) => {
		setGameCustoms((prevSettings) => ({ ...prevSettings, bgColor: color }))
	};

	const handlePalette = () => {
		if (palette)
			setGameCustoms((prevSettings) => ({ ...prevSettings, palette: 0 }))
		else if (!palette)
			setGameCustoms((prevSettings) => ({ ...prevSettings, palette: 1 }))
		setPalette((prevPalette: boolean) => !prevPalette);
	}

	const handlePaletteRadio = (e: React.ChangeEvent<HTMLInputElement>) => {
		setGameCustoms((prevSettings) => ({ ...prevSettings, palette: parseInt(e.target.value) }))
	}

	const saveGameCustoms = async () => {
		await fetch(`${BACKEND_URL}/api/gameCustomization/update/`, {
			method: 'PUT',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': Cookies.get('csrftoken') as string
			},
			body: JSON.stringify({
				user: session?.user?.id,
				background: gameCustoms.background,
				palette: gameCustoms.palette,
				bgColor: gameCustoms.bgColor,
				opacity: gameCustoms.opacity,
				sparks: gameCustoms.sparks,
			})
		});
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
									value={gameCustoms.background}
									onChange={() => setGameCustoms((prevSettings) => ({ ...prevSettings, background: 0 }))}
									checked={(gameCustoms.background >= 0 && gameCustoms.background <= 3)}
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
									value={gameCustoms.background}
									onChange={() => setGameCustoms((prevSettings) => ({ ...prevSettings, background: 4 }))}
									checked={(gameCustoms.background === 4 || gameCustoms.background === 5)}
								/>
								<label className="form-check-label" htmlFor="flexRadioDefault2">
									Static Background
								</label>
							</div>
						</div>

						{(gameCustoms.background >= 0 && gameCustoms.background <= 3) && (
							<>
								<div className="mb-3">
									<select
										className="form-select"
										aria-label="Animated Background"
										value={gameCustoms.background}
										onChange={(e) => setGameCustoms((prevSettings) => ({ ...prevSettings, background: e.target.value === "" ? 0 : parseInt(e.target.value) }))}
									>
										<option value="">Select Animated Background</option>
										<option value={0}>Default</option>
										<option value={1}>Lightsquares</option>
										<option value={2}>Waves</option>
										<option value={3}>Fractcircles</option>
									</select>
								</div>

								<div className="d-flex align-items-center mb-2">
									<label className="form-check-label me-2" htmlFor="flexSwitchCheckDefault">Single </label>
									<div className="form-check form-switch">
										<input
											className="form-check-input"
											type="checkbox"
											role="switch"
											id="flexSwitchCheckDefault"
											checked={palette}
											onChange={handlePalette}
										/>
										<label className="form-check-label" htmlFor="flexSwitchCheckDefault">Palette</label>
									</div>
								</div>

								{!palette &&
									<div className="mb-3 text-center">
										<label htmlFor="favcolor" className="form-label">Select color</label>
										<div className="align-items-center justify-content-center">
											<HexColorPicker
												color={gameCustoms.bgColor}
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
												checked={gameCustoms.palette === 1}
												onChange={handlePaletteRadio}
											/>
											<label className="btn" htmlFor="palette1">
												<img src='/palette/palette_1.gif' width="220" height="60" alt="palette 1" />
											</label>
										</div>
										<div className="paletteButton">
											<input type="radio"
												className="btn-check"
												name="palette-options"
												value={2}
												id="palette2"
												autoComplete="off"
												checked={gameCustoms.palette === 2}
												onChange={handlePaletteRadio}
											/>
											<label className="btn" htmlFor="palette2">
												<img src='/palette/palette_2.gif' width="220" height="60" alt="palette 2" />
											</label>
										</div>
										<div className="paletteButton">
											<input type="radio"
												className="btn-check"
												name="palette-options"
												value={3}
												id="palette3"
												autoComplete="off"
												checked={gameCustoms.palette === 3}
												onChange={handlePaletteRadio}
											/>
											<label className="btn" htmlFor="palette3">
												<img src='/palette/palette_3.gif' width="220" height="60" alt="palette 3" />
											</label>
										</div>
										<div className="paletteButton">
											<input type="radio"
												className="btn-check"
												name="palette-options"
												value={4}
												id="palette4"
												autoComplete="off"
												checked={gameCustoms.palette === 4}
												onChange={handlePaletteRadio}
											/>
											<label className="btn" htmlFor="palette4">
												<img src='/palette/palette_4.gif' width="220" height="60" alt="palette 4" />
											</label>
										</div>
									</div>
								}
							</>
						)}

						{(gameCustoms.background === 4 || gameCustoms.background === 5) && (
							<div className="mb-3">
								<select
									className="form-select"
									aria-label="Static Background"
									value={gameCustoms.background}
									onChange={(e) => setGameCustoms((prevSettings) => ({ ...prevSettings, background: e.target.value === "" ? 0 : parseInt(e.target.value) }))}
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
								value={gameCustoms.opacity}
								onChange={(e) => setGameCustoms((prevSettings) => ({ ...prevSettings, opacity: parseInt(e.target.value) }))}
							/>
							<div className="mb-1">
								<p>{gameCustoms.opacity}%</p>
							</div>

							<div className="form-check form-switch mb-3">
								<input
									className="form-check-input"
									type="checkbox"
									role="switch"
									id="flexSwitchCheckDefault"
									checked={gameCustoms.sparks}
									onChange={() => setGameCustoms((prevSettings) => ({ ...prevSettings, sparks: !gameCustoms.sparks }))}
								/>
								<label className="form-check-label" htmlFor="flexSwitchCheckDefault">Collision Sparks</label>
							</div>

							<div>
								<button className="m-1 btn btn-warning" onClick={() => saveGameCustoms()} data-bs-dismiss="offcanvas">Save</button>
								<button className="m-1 btn btn-primary" onClick={() => setGameCustoms(defaultSettings)}>Reset to Default</button>
							</div>

						</div>

					</div>
				</div>
			</div>

			<div className="d-flex flex-column align-items-center">
				<div className="m-2">
					<button className={`btn btn-warning rounded-pill ${styles.button} ${isMounted ? styles.mounted : ''}`}
						type="button"
						data-bs-toggle="offcanvas"
						data-bs-target="#offcanvasCustomization"
						aria-controls="offcanvasCustomization">
						Display Settings
					</button>
				</div>
			</div>
		</>)
}