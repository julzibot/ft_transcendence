interface Creator {
  id: number;
  username: string;
  image_url: string;
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