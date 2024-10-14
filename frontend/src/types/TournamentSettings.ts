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
  numberOfPlayers: number,
  creator: Creator,
  linkToJoin: string,
}