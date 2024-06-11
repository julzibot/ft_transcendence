'use client';
import React, { createContext, useContext, useState } from 'react';

interface IGameContext {
	game: string;
	setGame: (game: string) => void;
}

export const GameContext = createContext<IGameContext>({
	game: '',
	setGame: () => {},
});

interface GameProviderProps {
	children: React.ReactNode;
}

export default function GameProvider({ children }: GameProviderProps) {
	const [game, setGame] =	useState('');

	return (
		<GameContext.Provider value={{ game, setGame }}>
			{children}
		</GameContext.Provider>
	)
}

export const useGameContext = () => {
	return useContext(GameContext);
  }

