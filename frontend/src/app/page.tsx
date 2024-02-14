import { options } from "./api/auth/[...nextauth]/options"
import { getServerSession } from "next-auth/next"
import Link from 'next/link'

export default async function Home() {
  const session = await getServerSession(options)

  return (
    <>
      {session ? (
        <>
          <h1>Hello {session.user.name}</h1>
          <Link href="/api/auth/signout">Sign Out</Link>
        </>
      ) : (
        <Link href="/api/auth/signin">Sign In</Link>
      )}
    </>
  )
}