export interface User {
	id: number;
	username: string;
	image: string;
}

export interface TournamentSettingsType {
	name: string,
	isStarted: boolean,
	power_ups: boolean,
	timer: number,
	maxPlayerNumber: number,
	pointsPerGame: number,
	numberOfPlayers: number,
	difficultyLevel: number,
	creator: User | null,
	linkToJoin: string,
}

export interface ParticipantType {
	user: {
		id: number;
		username: string;
		image: string;
	}
	wins: number;
	gamesPlayed: number;
}

export interface TournamentType {
	id: string;
	name: string;
	creator: User;
	participants: ParticipantType[];
	settings: TournamentSettingsType;
	timer: number;
	difficultyLevel: number;
	pointsPerGame: number;
	power_ups: boolean;
	isStarted: boolean;
}

export interface Pair {
	player1: User;
	player2: User;
}