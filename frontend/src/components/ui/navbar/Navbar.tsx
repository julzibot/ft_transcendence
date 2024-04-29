import Link from "next/link"
import AuthButton from "./AuthButton"
import Image from "next/image"
import FriendList from "../friend_list/FriendList"
import "./styles.css"

export default function Navbar() {

  return(
    <>
			<nav className="navbar navbar-expand-lg navbar-dark bg-dark">
				<div className="container-fluid">
					<Link href="/" className="ms-2 text-decoration-none navbar-brand">
						<Image
							src="/static/images/42.png"
							style={{filter: "invert(100%)"}}
							width={35}
							height={35}
							alt="42 Logo"
						/>
						<span className="ms-2 text-light fw-bold">Transcendence</span>
					</Link>

					<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
						<span className="navbar-toggler-icon"></span>
					</button>

					<div className="collapse navbar-collapse custom-collapse" id="navbarSupportedContent">
						<ul className="navbar-nav me-auto mb-lg-0">
							<li className="nav-item custom-item">
							</li>
							<li className="nav-item custom-item d-flex align-items-center px-2">
								<button className="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offCanvasFriendList" aria-controls="offCanvasFriendList">Play with Friends</button>
							</li>
							<li className="nav-item custom-item d-flex align-items-center px-2">
								<Link href="/game">
        				  <button className="btn btn-info">Play</button>
      				  </Link>
							</li>
							<li className="nav-item custom-item d-flex align-items-center px-2">
								<Link href="/chat/test">
        				  <button className="btn btn-info">Chat</button>
      				  </Link>
							</li>
						</ul>
						<div className="custom-item">
     		  		<AuthButton/>
						</div>
					</div>

				</div>
			</nav>
			<FriendList />
    </>)
}