'use client';

import Link from "next/link"
import Join from "../../../components/game/Join"
import { useSession } from "next-auth/react"
import { useEffect, useState, useContext } from "react"
import io from "socket.io-client"
import { SocketContext, socket } from "../../../../context/socket"

export default function CreateGame() {

  return (
		<>
			<div className="d-flex flex-column align-items-center justify-content-center h-100">

			<div className="container m-3">
				<div className="row justify-content-center">

					<div className="col-lg-auto mb-3 d-flex align-items-stretch justify-content-center">
						<div className="card text-center p-3">
							<div className="m-3">
								<h4 className="card-title">Create Game</h4>
							</div>
							<div className="m-2">
							<Link href="game/local">
								<button className="btn btn-danger" type="button">Play With Friends</button>
							</Link>
							</div>
							<div className="m-2">
								<Link href="game/online">
									<button className="btn btn-danger" type="button">Play Online</button>
								</Link>
							</div>
						</div>
					</div>

				</div>
			</div>

			</div>
		</>
  )
}
