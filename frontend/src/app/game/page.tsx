'use client';

import ThreeScene from "../../components/game/Game"
import Join from "../../components/game/Join"
import { useSession } from "next-auth/react"
import { useEffect, useState, useContext } from "react"
import io from "socket.io-client"
import { SocketContext, socket } from "../../../context/socket"

export default function Play() {

	const gameSocket = socket;
  const { data: session, status } = useSession();
  const {room, setRoom} = useState("");
	const [userId, setUserId] = useState(null);

  useEffect(() => {
		if (status === "authenticated" && session) {
			setUserId(session.user.id);
		}
	}, [session, status]);

	if (status === "Loading" || !userId) {
		return (
			<div>Loading...</div>
		);
	}

  return (
    <>
			<SocketContext.Provider value={socket}>
				{/* {
					<button className="btn btn-primary" onClick={joinGame}>Join a game</button>
				}
				
				{(gameJoined && userId) ? <ThreeScene user_id={userId} /> : <div>Loading data...</div>} */}
				<Join user_id={userId} />
			</SocketContext.Provider>
    </>
  )
}
