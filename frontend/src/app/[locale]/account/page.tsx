import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "../../api/auth/[...nextauth]/options";

export default async function AccountPage() {
  const session = await getServerSession(authOptions)

  return(
    <>
      <h1>Account</h1>
      <Link href={`/en/account/profile/${session?.user.id}`}>Profile</Link>
    </>
  )
}