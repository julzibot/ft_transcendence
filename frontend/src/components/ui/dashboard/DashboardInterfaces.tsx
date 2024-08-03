'use client'

export interface MatchEntry {
	x: Date,
	y: number
}

export interface GameMatch {
	player1: number,
	player2: number,
	score1: number,
	score2: number,
	date: Date
}
