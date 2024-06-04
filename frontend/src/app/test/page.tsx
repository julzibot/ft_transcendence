"use client";

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Test from "../../components/testComponent/Test"
import io from "socket.io-client"

export default function Page() {

	const { data: session, status } = useSession();
	const [userId, setUserId] = useState(null);
	// const [socket, setSocket] = useState(null);

	const socket = io('http://localhost:6500');
	// useEffect(() => {
	// 	if (socket === null) {
	// 		setSocket(io('http://localhost:6500', {
	// 			autoConnect: false,
	// 		}));
	// 	}
	// 	// 	return () => {
	// 	// 		socket?.disconnect();
	// 	// 	};
	// 	// };
	// }, [socket]);

	// console.log("SOCKET ID: " + socket.id);

	useEffect(() => {
		if (status === "authenticated" && session) {
			setUserId(session.user.id);
		}
	}, [session, status]);

	if (status === "Loading") {
		return (
			<div>Loading...</div>
		);
	}

	return (
		<>
			{(socket && userId) ? <Test socket={socket} user_id={userId} /> : <div>Loading data...</div>}
		</>
	)
}