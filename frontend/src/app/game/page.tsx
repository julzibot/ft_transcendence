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

				<h2 className="m-3 text-decoration-underline">Game Mainpage</h2>
				<div className="container">

					<div className="row justify-content-center">
						<div className="col-lg-auto mb-3 d-flex align-items-stretch justify-content-center">
							<div className="card text-center">
								<div className="m-3">
									<h5 className="card-title">Local Game</h5>
								</div>	
								<div className="card-body d-flex flex-column">
									<div className="m-3 d-flex align-items-center justify-content-center">
										<Link href="game/local">
											<button className="btn btn-primary">Play</button>
										</Link>
									</div>
								</div>
							</div>
						</div>

						<div className="col-lg-auto mb-3 d-flex align-items-stretch justify-content-center">
						
							<div className="card text-center">
								<div className="card-body d-flex flex-column">
									<h5 className="card-title">Online Game</h5>
									<div className="input-group mt-3">
										<input type="text" className="form-control" placeholder="Enter Game ID" aria-label="Join Online Game" aria-describedby="button-addon2" />
										<Link href="game/local">
											<button className="btn btn-outline-secondary" type="button" id="button-addon2">Join Game</button>
										</Link>
									</div>
									<h5 className="m-2">or</h5>
									<div className="m-2">
										<Link href="game/online/create_game">
											<button className="btn btn-warning">Create Game</button>
										</Link>
									</div>
								</div>
							</div>
						</div>
					</div>

				</div>

			</div>
		</>
  )
}
