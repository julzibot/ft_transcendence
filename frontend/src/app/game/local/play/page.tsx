"use client"

import ThreeScene from "@/components/game/Game"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { GameSettings } from "@/types/GameSettings"
import EndGameCard from "@/components/cards/EndGameCard";

interface GameInfos {
	game_id: number,
	p1Name: string,
	p2Name: string,
	p1p: string,
	p2p: string
}
interface LocalProps {
	gameInfos: GameInfos,
	gameSettings: GameSettings,
	userId: number,
	gameMode: number
}

export default function Play() {
	
	const router = useRouter();
	const [localProps, setLocalProps] = useState<LocalProps | null>(null);
	const [start, setStart] = useState<Boolean>(false);
	const [gameEnded, setGameEnded] = useState<Boolean>(false);

	const handleGameEnded = () =>
	{
		setGameEnded(true);
	}

	useEffect(() => {
		const props = localStorage.getItem('localProps');
		if (props) {
			const obj = JSON.parse(props);
			setLocalProps(obj);
			setStart(true);
		} else {
			router.push('/game/local');
		}
		// <!> TODO <!> uncomment return
		// return (() => {
		// 	localStorage.removeItem('localProps');
		// })
	}, []);

	return (
		<>
		{
			start && (
			<> 
				<ThreeScene gameInfos={localProps.gameInfos} gameSettings={localProps.gameSettings} room_id={-1} user_id={localProps.userId} isHost={true} gamemode={localProps.gameMode} handleGameEnded={handleGameEnded} />
				{ gameEnded && <EndGameCard/>}
			</> )

		}
		</>
	)
}