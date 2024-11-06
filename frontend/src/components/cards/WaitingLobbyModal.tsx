import { Spinner } from 'react-bootstrap';
import Image from '../Utils/Image';

export default function WaitingLobbyModal({ players }: { players: any }) {

	return (
		<div className={`modal fade show d-block`} id="staticBackDrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1}>
			<div className={`modal-dialog modal-lg modal-dialog-centered`}>
				<div className={`modal-content`}>
					<div className="modal-body">
						<div className="d-flex justify-content-center align-items-center">
							{players && players.player1 ? (
								<div className="justify-content-center col-6 d-flex align-items-center" style={{ height: '100px' }}>
									<div className="d-flex flex-row align-items-center">
										<Image
											className="me-3"
											src={players?.player1?.image}
											whRatio="99px"
											alt={`${players.player1.username}'s profile picture`}
										/>
										<span className="me-2 text-truncate fs-2" style={{ maxWidth: 'calc(80%)' }}>{players.player1.username}</span>
									</div>
								</div>
							) : (
								<div className="d-flex justify-content-center">
									<Spinner className=" border-dark-subtle" animation="border" style={{ width: '99px', height: '99px', borderWidth: "3px", borderRight: "none", borderLeft: "none", borderBottom: "none", animationDuration: "0.8s" }} />
								</div>
							)}
							<h2 className="pt-2">vs</h2>
							{players && players.player2 ? (
								<div className="justify-content-center col-6 d-flex align-items-center">
									<div className="d-flex flex-row align-items-center">
										<span className="me-2 text-truncate fs-2" style={{ maxWidth: 'calc(80%)' }}>{players.player2.username}</span>
										<Image
											className='ms-2'
											src={players?.player2.image}
											alt={`${players.player2.username}'s profile`}
											whRatio="99px"
										/>
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
