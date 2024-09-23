"use client"

import ThreeScene from "@/components/game/Game"
import { useState } from "react"

export default function Play() {
    const [localProps, setLocalProps] = useState(() => {
        const props = localStorage.getItem("localProps");
        const obj = JSON.parse(props ?? "{}");
        localStorage.removeItem("localProps");
        return obj || {}
    })
    return (
    <ThreeScene gameInfos={localProps.gameInfos} gameSettings={localProps.gameSettings} room_id={-1} user_id={localProps.userId} isHost={true} gamemode={localProps.gameMode} />
)
}