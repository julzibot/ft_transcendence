"use client";

import { useState, useEffect } from "react"

type Props = {
  params: {
    room_name: string;
  };
};

export default function Chat(Props: Props) {
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [chatLog, setChatlog] = useState<string>('')


  const webSocketConnect = () => {

    const chatSocket = new WebSocket(
      `ws://localhost:8000/ws/chat/${Props.params.room_name}/`
    );

    chatSocket.onopen = function() {
      setSocket(chatSocket)
    }

    chatSocket.onmessage = function(e) {
      const data = JSON.parse(e.data);
      setChatlog(prev => (prev + (data.message + "\n")))
    };

    chatSocket.onclose = function() {
      console.error('Chat socket closed unexpectedly');
    };
  }

  useEffect(() => {
    webSocketConnect()
  }, [])

  const handleClick = () => {
    socket?.send(JSON.stringify({message: message}))
    setMessage('')
  }

  return(
    <>
      <textarea id="chat-log" value={chatLog} cols="100" rows="20"></textarea><br></br>
      <input type="text" value={message} onChange={(e) => setMessage(e.target.value)}/>
      <button className="btn btn-primary" onClick={() =>handleClick()}>Submit</button>
    </>
  )
}
