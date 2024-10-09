import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export default function FortyTwoSigninButton() {
  const [pending, setPending] = useState(false);

  return (
    <>
      <Link href="/api/auth/signin">
        <button disabled={pending} className="btn btn-dark mb-1 fs-4" onClick={() => setPending(true)}>
        Sign in with
        { pending ? <span className="spinner-border spinner-border ms-2" role="status" aria-hidden="true"></span> : (
          <Image
            className="ms-1 me-1"
            src="/static/images/42.png"
            style={{ filter: "invert(100%)" }}
            width={30}
            height={30}
            alt="42 Logo"
            fetchPriority="high"
            />
        )}
          </button>
        </Link>
    </>
  )
}