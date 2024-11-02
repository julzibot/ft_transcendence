'use client'

export interface MatchEntry {
	x: string,
	y: number
}

export interface Player {
	id: number,
	username: string,
	image: string | null
}

export interface GameMatch {
	player1: Player,
	player2: Player,
	score1: number,
	score2: number,
	game_mode: number,
	date: string
}