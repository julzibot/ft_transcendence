'use client';

import Link from "next/link"
import Join from "../../../components/game/Join"
import { useSession } from "next-auth/react"
import { useEffect, useState, useContext } from "react"
import io from "socket.io-client"
import { SocketContext, socket } from "../../../../context/socket"

export default function GameMain() {

  return (
		<>
			<div className="d-flex flex-column align-items-center justify-content-center h-100">

				<h2 className="mt-3">Game Mainpage</h2>

				<div className="m-2">
					<Link href="game/local">
						<button className="btn btn-primary">Local Game</button>
					</Link>
				</div>
				<div className="m-2">
					<Link href="game/online">
						<button className="btn btn-primary">Online Game</button>
					</Link>
				</div>

			</div>
		</>
  )
}
