import { authOptions } from "@/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

type Props = {
  params: {
    id: string;
  };
};

async function ProfilePage(props: Props){
  const session = await getServerSession(authOptions);
  const response = await fetch(`http://localhost:8000/api/user/`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${session?.backendTokens.access}`,
      "Content-Type": "application/json",
    },
  });
  if(response.ok) {
    const user = await response.json();
    return (
      <>
        <h1>Profile</h1>
        <p>{user.name}</p>
        <p>{user.email}</p>
      </>
    );
  }
  else {
    return(<h1>Error</h1>)
  }
};

export default ProfilePage;