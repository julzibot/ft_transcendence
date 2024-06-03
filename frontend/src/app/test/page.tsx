"use client";

import io from "socket.io-client"
import { useEffect, useState } from "react"



export default function Page() {
  const socket = io("http://localhost:6500");
  const [buttonText, setButtonText] = useState("Send Message");
	const [newMessageRcvd, setNewMessageRcvd] = useState("");

	const joinRoom = () => {
			socket.emit("join_room", 26);
	};

	const sendMessage = () => {

		const message = "Hello from the client!";
		const room_id = 26;
		socket.emit("myEvent", {message, room_id});
	};

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected to: " + socket.id)
    })

    socket.on("serverResponse", (data) => {
      setButtonText(data)
    })

    return () => {
      // socket.disconnect()
    }
  }, [])

	useEffect(() => {
		socket.on('receive_message', (data) => {
			setNewMessageRcvd((prevMsg) => prevMsg + "\n" + data.message);
			console.log("newMSGreceived:", newMessageRcvd);
		})
	}, [socket]);

  return(
		<div>
			<button onClick={joinRoom}>Join Room</button>
			<button className="btn btn-primary" onClick={sendMessage}>{buttonText}</button>
			<p>{newMessageRcvd}</p>
		</div>
  )
}