"use client";

import io from "socket.io-client"
import { useEffect, useState } from "react"



export default function Page() {
  const socket = io("http://localhost:5000")
  const [buttonText, setButtonText] = useState("Send Message")

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

  return(
    <button className="btn btn-primary" onClick={() => {socket.emit('myEvent', 'Hello Server!')}}>{buttonText}</button>
  )
}