import Image from "next/image"
import { FORTY_TWO_CLIENT_UID, NEXT_PUBLIC_DOMAIN, SESSION_SECRET } from "@/config";

export default function FortyTwoSigninButton() {
  
  async function signInWith42() {
    const url = new URL('https://api.intra.42.fr/oauth/authorize')
    url.searchParams.append('client_id', FORTY_TWO_CLIENT_UID);
    url.searchParams.append('redirect_uri', `https://${NEXT_PUBLIC_DOMAIN}:3000/api/auth/callback/42-school`);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scope', 'public');
    url.searchParams.append('state', SESSION_SECRET);
    window.location.href = url.toString();
  }


  return (
    <>
      <button className="btn btn-dark mb-1 fs-4 " onClick={signInWith42}>
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