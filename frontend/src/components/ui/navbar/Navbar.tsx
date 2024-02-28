import Link from "next/link"
import AuthButton from "./AuthButton"
import Image from "next/image"

export default function Navbar() {

  return(
    <>
      <nav className="navbar navbar-dark bg-dark">
        <Link href="#" className="ms-2 text-decoration-none">
          <Image
            src="/static/images/42.png"
            style={{filter: "invert(100%)"}}
            width={35}
            height={35}
            alt="42 Logo"
          />
        <span className="ms-2 text-light fw-bold">Transcendence</span>
        </Link>
        <AuthButton/>
      </nav>
    </>)
}