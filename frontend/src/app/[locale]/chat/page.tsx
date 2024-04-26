"use client";
import {useState, useEffect, formEvent} from "react";

export default function Chat()
{
    const   [message, setMessage] = useState("")
    const   [log, setlog] = useState("")
    const   [chatSocket, setchatSocket] = useState(null)

    function handleSubmit(event: FormEvent<HTMLFormElement>)
    {
        chatSocket.send(
            JSON.stringify({
                "message": message})
        );
        setlog(log + "\n" + message);
        console.log(message);
    }

    useEffect(() => {

        setchatSocket(new WebSocket("ws://localhost:8000/ws/chat/1/"));
        if (chatSocket)
        {
            chatSocket.onmessage = (event) =>
            {
                console.log("Received message", event.data);
            }
        }
    },[]);

    return (
        <>
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)}/>
            <button type="button" className="btn btn-primary" onClick={handleSubmit}>Submit</button>
            <div >{log}</div>
        </>
    )
}