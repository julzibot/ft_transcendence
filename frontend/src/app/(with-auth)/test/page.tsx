'use client'

import GameCountdownModal from "@/components/cards/GameCountdownModal";
import useSocketContext from "@/context/socket";
import { useEffect } from 'react'

export default function Test() {

	const socket = useSocketContext();

	useEffect(() => {
		console.log('Hello');
	}, []);
	return (
		<>
			<p>HELLO</p>
		</>)
}