import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/app/lib/AuthContext";

export default function FortyTwoSigninButton() {
  const { loading, setLoading } = useAuth()

  return (
    <>
      <Link href="/api/auth/signin">
        <button disabled={!loading} className="btn btn-dark mb-1 fs-4" onClick={() => setLoading(!loading)}>
          Sign in with
          <Image
            className="ms-1 me-1"
            src="/static/images/42.png"
            style={{ filter: "invert(100%)" }}
            width={30}
            height={30}
            alt="42 Logo"
            fetchPriority="high"
          />
        </button>
      </Link>
    </>
  )
}