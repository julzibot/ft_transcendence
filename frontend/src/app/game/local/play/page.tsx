'use client';

import Join from "../../../../components/game/Join"
import { useEffect, useState, useContext } from "react"
import { SocketContext, socket } from "../../../../../context/socket"

export default function Play() {

	return (
	<>
		<SocketContext.Provider value={socket}>
			<Join remoteGame={false} />
		</SocketContext.Provider>
	</>
	)
}
