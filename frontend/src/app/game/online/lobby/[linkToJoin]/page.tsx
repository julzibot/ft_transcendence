"use client";

import { useParams } from "next/navigation"
import { useSession } from "next-auth/react";
import { SocketProvider } from "@/context/socket";
import Join from "@/components/game/Join";

export default function Lobby() {
  const { data:session } = useSession();
  const { linkToJoin } = useParams()

  const gameSettings = {
    gameDifficulty: 4,
    pointsToWin: 5,
    powerUps: false,
		background: 0, // 0 - 3 animated, 4 - 5 static
		palette: 0, // palette: 4 choices
		bgColor: '#ff0000',
		opacity: 80,
		sparks: true,
  };

  return (
    <>
      <SocketProvider>
        <Join userId={session?.user.id} room={linkToJoin} gameSettings={gameSettings} gameMode={2} />
      </SocketProvider>
    </>
  )
}