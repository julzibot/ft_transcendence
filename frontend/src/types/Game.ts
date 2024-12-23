export interface GameCustoms {
	background: number,
	palette: number,
	bgColor: string,
	opacity: number,
	sparks: boolean,
}

export interface GameSettings {
	game_difficulty: number;
	points_to_win: number;
	power_ups: boolean;
}

export interface GameInfos {
	game_id: number;
	p1Name: string | undefined;
	p2Name: string;
	p1p: string | undefined;
	p2p: string;
	game_mode: number | null
}

export interface FinalSettings {
	background: number;
	palette: number,
	bgColor: string,
	opacity: number,
	sparks: boolean,
	game_difficulty: number;
	points_to_win: number;
	power_ups: boolean;
}