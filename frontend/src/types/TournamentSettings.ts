interface Creator {
  id: string;
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
  creator: Creator,
  linkToJoin: string,
}

export interface ParticipantType {
  user: {
    id: string;
    username: string;
    image: string;
  }
  wins: number;
  gamesPlayed: number;
}