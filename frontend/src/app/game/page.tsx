'use client';

import ThreeScene from "../../components/game/Game"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import io from "socket.io-client"

export default function Play() {

  const { data: session, status } = useSession();
  const {room, setRoom} = useState("");
	const [userId, setUserId] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  useEffect(() => {
		if (status === "authenticated" && session) {
			setUserId(session.user.id);
		}
	}, [session, status]);

  useEffect(() => {
    if (socket && userId) {
      socket.emit('join_room', { room_id: 1, user_id: userId });
    }
  }, [socket, userId]);

	if (status === "Loading") {
		return (
			<div>Loading...</div>
		);
	}

  if (!socket || !userId) {
    return <div>Loading...</div>;
  }
  if (socket)
    console.log("socket id: " + socket.id);
  return (
    <>
    {(socket && userId) ? <ThreeScene socket={socket} user_id={userId} /> : <div>Loading data...</div>}
    </>
  )
}
