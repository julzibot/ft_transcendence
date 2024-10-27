import { BACKEND_URL } from '@/config';
import { Spinner } from 'react-bootstrap';

export default function WaitingLobbyModal({ players }) {
	return (
		<div className={`modal fade show d-block`} id="staticBackDrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1}>
			<div className={`modal-dialog modal-lg modal-dialog-centered`}>
				<div className={`modal-content`}>
					<div className="modal-body">
						<div className="d-flex justify-content-center align-items-center">
							{players && players.player1 ? (
								<div className="justify-content-center col-6 d-flex align-items-center" style={{ height: '100px' }}>
									<div className="d-flex flex-row align-items-center">
										<div className="me-3 position-relative border border-3 border-dark-subtle rounded-circle" style={{ width: '100px', height: '100px', overflow: 'hidden' }}>
											<img
												style={{
													objectFit: 'cover',
													width: '100%',
													height: '100%',
													position: 'absolute',
													top: '50%',
													left: '50%',
													transform: 'translate(-50%, -50%)'
												}}
												fetchPriority="high"
												alt={`${players.player1.username}'s profile`}
												src={`${BACKEND_URL}${players.player1.image}`}
											/>
										</div>
										<span className="me-2 text-truncate fs-2" style={{ maxWidth: 'calc(80%)' }}>{players.player1.username}</span>
									</div>
								</div>
							) : (
								<div className="d-flex justify-content-center mt-5">
									<Spinner animation="border" style={{ width: '15rem', height: '15rem', borderWidth: "2px", borderRight: "none", borderLeft: "none", borderTopColor: 'white', borderBottom: "none", animationDuration: "0.7s" }} />
								</div>
							)}
							<h2 className="pt-2">vs</h2>
							{players && players.player2 ? (
								<div className="justify-content-center col-6 d-flex align-items-center">
									<div className="d-flex flex-row align-items-center">
										<span className="me-2 text-truncate fs-2" style={{ maxWidth: 'calc(80%)' }}>{players.player2.username}</span>
										<div className="ms-2 position-relative border border-3 border-dark-subtle rounded-circle" style={{ width: '70px', height: '70px', overflow: 'hidden' }}>
											<img
												style={{
													objectFit: 'cover',
													width: '100%',
													height: '100%',
													position: 'absolute',
													top: '50%',
													left: '50%',
													transform: 'translate(-50%, -50%)'
												}}
												fetchPriority="high"
												alt={`${players.player2.username}'s profile`}
												src={`${BACKEND_URL}${players.player2.image}`}
											/>
										</div>
									</div>
								</div>
							) : (
								<div className="d-flex col-6" style={{ height: '100px' }}>
									<div className="ms-5 ps-3 d-flex flex-row align-items-center">
										<h3 className="placeholder col-9 me-4"></h3>
										<div className="d-flex justify-content-center">
											<Spinner className=" border-dark-subtle" animation="border" style={{ width: '99px', height: '99px', borderWidth: "3px", borderRight: "none", borderLeft: "none", borderBottom: "none", animationDuration: "0.8s" }} />
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
