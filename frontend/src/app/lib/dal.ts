import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/dist/server/api-utils';

export const verifySession = cache(async () => {
  const cookie = cookies().get('sessionid')?.value;
  const session =
  //decrypt cookie

  if (!session?.user)
    redirect('/auth/signin');

  return { isAuth: true, user: session.user };
})
