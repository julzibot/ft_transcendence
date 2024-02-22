import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "../../api/auth/[...nextauth]/options";

type Props = {
  children: React.ReactNode;
};

async function AccountLayout(props: Props) {
  const session = await getServerSession(authOptions);
  
  return (
    <div>
      <Link href={`/en/account/profile/${session?.user.id}`}>Profile</Link>
      {props.children}
    </div>
  );
};

export default AccountLayout;