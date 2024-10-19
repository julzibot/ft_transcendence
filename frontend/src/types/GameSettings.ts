export interface GameSettingsType {
	user: number,
	background: number,
	palette: number,
	bgColor: string,
	opacity: number,
	sparks: boolean,
	game_difficulty: number,
	points_to_win: number,
	power_ups: boolean
}

export interface GameSettingsProps {
	setGameSettings: Function,
	gameSettings: GameSettingsType
}