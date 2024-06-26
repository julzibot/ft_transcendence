'use client';

import Link from "next/link"
import Join from "../../../components/game/Join"
import { useSession } from "next-auth/react"
import { useEffect, useState, useContext } from "react"
import io from "socket.io-client"
import { SocketContext, socket } from "../../../../context/socket"
import "./styles.css"

export default function GameMain() {
  return (
		<>
		<div>
			<div className="d-flex flex-column align-items-center justify-content-center h-100">
				<h2 className="m-3 mb-5">Game Mainpage</h2>
			</div>
			<div className="container">

					<div className="row justify-content-center">
						<div className="col-lg-auto mb-3 d-flex align-items-stretch justify-content-center">

							<div className="card l-bg-cherry me-5">
								<Link href="game/local" style={{color: 'white', textDecoration: 'none'}}>
									<div className="card-statistic-3 p-4">
											<div className="card-icon card-icon-large"><i className="fas fa-shopping-cart"></i></div>
												<div className="mb-4 card-text">
													<h5 className="card-title mb-4">Offline Mode</h5>
												</div>
												<div className="row align-items-center mb-2 d-flex">
														<div className="col-8 card-text">
																<h2 className="d-flex align-items-center mb-0 mt-2">
																		Play Locally
																</h2>
														</div>
												</div>
										</div>
								</Link>
          	  </div>
						</div>

					<div className="col-lg-auto mb-3 d-flex align-items-stretch justify-content-center">
						<div className="card l-bg-green-dark ms-5">
							<div className="card-statistic-3 p-4">
								<div className="card-icon card-icon-large"><i className="fas fa-shopping-cart"></i></div>
									<div className="mb-2 card-text">
										<h5 className="card-title">Online Mode</h5>
									</div>
									<div className="card-body d-flex flex-column text-center">

										<div className="input-group mt-2">
											<input type="text" className="form-control shadow-none rounded" placeholder="Enter Game ID" aria-label="Join Online Game" aria-describedby="button-addon2" />
											<Link href="game/local">
												<button className="btn btn-info ms-1" type="button" id="button-addon2">Join Game</button>
											</Link>
										</div>

										<h5 className="m-2">or</h5>
										<div className="mt-1">
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
		</div>
		</>
  )
}
