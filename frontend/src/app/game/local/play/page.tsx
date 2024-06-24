'use client';

import Join from "../../../../components/game/Join"
import { useEffect, useState, useContext } from "react"
import io from "socket.io-client"
import { SocketContext, socket } from "../../../../../context/socket"
import '../custom.scss'

export default function Play() {

	return (
	<>
		<SocketContext.Provider value={socket}>
			<Join />
		</SocketContext.Provider>
	</>
	)
}
