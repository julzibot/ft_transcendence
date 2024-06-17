'use client';

import Link from "next/link"
import Join from "../../../components/game/Join"
import { useSession } from "next-auth/react"
import { useEffect, useState, useContext } from "react"
import io from "socket.io-client"
import { SocketContext, socket } from "../../../../context/socket"

export default function OnlineGame() {

  return (
		<>
			<div className="d-flex flex-column align-items-center justify-content-center h-100">

				<h2 className="mt-3">Online Game</h2>

				<div className="m-2">
						<div className="input-group mb-3">
							<input type="text" class="form-control" placeholder="Enter Game ID" aria-label="Join Online Game" aria-describedby="button-addon2" />
						<Link href="game/local">
							<button className="btn btn-outline-secondary" type="button" id="button-addon2">Join Game</button>
						</Link>
						</div>

				</div>
				<div className="m-2">
					<Link href="./online/create_game">
						<button className="btn btn-warning">Create Game</button>
					</Link>
				</div>

			</div>
		</>
  )
}
