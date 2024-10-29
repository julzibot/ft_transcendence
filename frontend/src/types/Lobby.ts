export interface LobbyPayload {
  name: string,
  difficultyLevel: number,
  pointsPerGame: number,
  power_ups: boolean,
  player1: number,
  gameMode?: 'ONLINE' | 'TOURNAMENT',
  tournamentLink?: string
}