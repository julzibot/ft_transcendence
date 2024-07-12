'use client';
import Link from "next/link"
import AuthButton from "./AuthButton"
import Image from "next/image"
import { useState } from "react";
import "./styles.css"
import FriendList from "../friend_list/FriendList";
import { Offcanvas } from 'react-bootstrap'

export default function Navbar() {
  const [show, setShow] = useState(false);


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
							/>
						<span className="ms-1 text-light fw-semibold">Transcendence</span>
					</Link>
				</div>

				<button
					className="btn btn-primary btn-lg"
					onClick={() => setShow(true)}
					>
					Friends
				</button>
				<Offcanvas
					show={show}
					onHide={() => setShow(false)}
					placement="end"
					scroll={false}
					> 
					<Offcanvas.Header closeButton>
						<Offcanvas.Title>Friend List</Offcanvas.Title>
					</Offcanvas.Header>
					<Offcanvas.Body>
						<FriendList />
					</Offcanvas.Body>
				</Offcanvas>

				<AuthButton/>
			</div>
		</nav>
	);
}