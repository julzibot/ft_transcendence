"use client";

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { MoonStarsFill } from "react-bootstrap-icons";
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

type Props = {
  params: {
    room_name: string;
  };
};

interface Messages {
	room: number;
	user: number;
	content: string;
}

export default function Chat(Props: Props) {

	const { data: session } = useSession();
	const user_id = session?.user?.id;

  const [socket, setSocket] = useState<WebSocket | null>(null)
	const [msgHistory, setMsgHistory] = useState<Messages[]>([])
	const [room_id, setRoomId] = useState<number>(0)
	const [messageInput, setMessageInput] = useState<string>('')

  useEffect(() => {

		const chatSocket = new WebSocket(
      `ws://localhost:8000/ws/chat/${Props.params.room_name}/`
    );

    chatSocket.onopen = function() {
      setSocket(chatSocket)
    }
		return () => socket?.close()
	}, [Props.params.room_name])

	useEffect(() => {

		const fetchRoomAndMsgs = async () => {
			const RoomResponse = await fetch(`http://localhost:8000/chat/${Props.params.room_name}`, {
				method: "GET"
			});
			if (RoomResponse.ok) {
				const data = await RoomResponse.json();
				setRoomId(data[0].id);
			}

			const MsgsResponse = await fetch(`http://localhost:8000/chat/${Props.params.room_name}/messages`, {
				method: "GET"
			});
			if (MsgsResponse.ok) {
				const data: Messages[] = await MsgsResponse.json();
				setMsgHistory(data);
				console.log(data)
			}
		}
	
		fetchRoomAndMsgs()
  }, [Props.params.room_name]);

	const sendMessage = async (room_id: number, user_id: number, content: string) => {
	
		console.log('user:', user_id)
		if (user_id) {
			console.log('room id:', room_id)
			const response = await fetch(`http://localhost:8000/chat/${Props.params.room_name}/messages`, {
			method: "POST",
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				"room": room_id,
				"user": user_id,
				"content": content
			})
			}).then(response => {
				if (response.status === 201)
					console.log('Message sent successfully')
				else
					console.log('Message already sent')
			}).catch(error => {
				console.error('Error sending message:', error)
			})

		}
	}

	const submitMessage = (e) => {
    e.preventDefault();

    const messageData = new FormData(e.target);
    const msgContent = Object.fromEntries(messageData.entries())

		console.log('submit user id:', user_id)
		if (user_id) {
			sendMessage(room_id, user_id || -1, msgContent.content.toString())
			const msg : Messages = {room: room_id, user: user_id, content: msgContent.content.toString()}
			setMsgHistory([...msgHistory, msg])
			setMessageInput('')
		}
}

  return(
    <>
			<div className="m-3 p-1">
				<button className="btn btn-secondary">Create a room</button>
				{msgHistory.map((message, index) => (
					<div className="p-2 m-2 border border-1 bg-light" key={index}>
						{message.user == user_id && (<span className="fw-bold" >You: </span>)}
						{message.user != user_id && (<span className="fw-bold">{message.user}: </span>)}
						<span>{message.content}</span>
					</div>
				))}
				<form onSubmit={submitMessage}>
					<Form.Control type="text" name="content" 
						placeholder="Enter your messsage..." value={messageInput} onChange={(e) => setMessageInput(e.target.value)}/>
					<Button type="submit" variant="primary">Submit</Button>
				</form>
			</div>
    </>
  )
} 
