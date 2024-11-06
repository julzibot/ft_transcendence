export interface LobbyPayload {
  name: string,
  difficultyLevel: number,
  pointsPerGame: number,
  power_ups: boolean,
  player1: number | undefined,
  gameMode?: 'ONLINE' | 'TOURNAMENT',
  tournamentLink?: string
}