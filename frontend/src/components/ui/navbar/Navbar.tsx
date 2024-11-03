import Link from "next/link"
import AuthButton from "./AuthButton"
import Image from "next/image"
import "./styles.css"

export default function Navbar() {
  return (
		<nav className="navbar navbar-expand-lg bg-dark">
			<div className="container-fluid justify-content-between">

				<div className="navbar-brand">
					<Link href="/" className="ms-2 text-decoration-none">
						<Image
							src="/static/images/42.png"
							style={{filter: "invert(100%)"}}
							width={35}
							height={35}
							alt="42 Logo"
							priority={true}
							/>
						<span className="ms-1 text-light fw-semibold">Transcendence</span>
					</Link>
				</div>
				<AuthButton/>
			</div>
		</nav>
	);
}