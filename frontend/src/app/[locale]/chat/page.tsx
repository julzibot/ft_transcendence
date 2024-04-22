"use client";
import {useState, formEvent} from "react";

export default function Chat()
{
    const chatSocket = new WebSocket("ws://localhost:8000/ws/chat/1/")

    const [message, setMessage] = useState("")

    function handleSubmit(event: FormEvent<HTMLFormElement>)
    { console.log(message) }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <input type="text" value={message} onChange={(e) => setMessage(e.target.value)}/>
                <button type="submit" className="btn btn-primary">Submit</button>
            </form>
        </>
    )
}