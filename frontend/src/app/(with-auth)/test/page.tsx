'use client'

import GameCountdownModal from "@/components/cards/GameCountdownModal";
import useSocketContext from "@/context/socket";
import { useEffect } from 'react'

export default function Test() {

    const socket = useSocketContext();

    useEffect(() => {
        if (socket) {
            socket.on('hi', data => {
                console.log(data);
            })
        }
    }, [socket]);
    return (
        <>
            <p>HELLO</p>
        </>)
}