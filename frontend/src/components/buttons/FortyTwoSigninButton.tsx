import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/app/lib/AuthContext";
import { FORTY_TWO_CLIENT_UID, FRONTEND_PORT, DOMAIN_NAME } from '@/config';

export default function FortyTwoSigninButton() {
  const { loading, setLoading } = useAuth()

  function generateRandomState() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let state = '';
    const length = 32;
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      state += characters[randomIndex];
    }
    return state;
  }


  const signInWithFortyTwo = async () => {
    setLoading(!loading)
    const state = generateRandomState()
    if (typeof window !== 'undefined')
      window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=${FORTY_TWO_CLIENT_UID}&redirect_uri=https://${DOMAIN_NAME}:${FRONTEND_PORT}/api/auth/callback/42-school&response_type=code&scope=public&state=${state}`;
  }

  return (
    <>
      <button disabled={!loading} className="btn btn-dark mb-1 fs-4" onClick={signInWithFortyTwo}>
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
    </>
  )
}