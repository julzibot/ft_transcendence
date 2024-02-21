import type {NextAuthOptions} from 'next-auth'
import FortyTwo from 'next-auth/providers/42-school';
import FortyTwoProvider from "next-auth/providers/42-school";
import Email from 'next-auth/providers/email';
import { notFound } from 'next/navigation';
//import CredentialsProvider from 'next-auth/providers/credentials';

export const options: NextAuthOptions = {
  providers: [
    FortyTwoProvider({
      clientId: process.env.FORTY_TWO_CLIENT_ID as string,
      clientSecret: process.env.FORTY_TWO_CLIENT_SECRET as string,
    }),
  ],

  callbacks: {
    async signIn({user}) {
      const userName = user.name
      const userEmail = user.email
      let response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: userName, email: userEmail}),
      });

      if(response.status === 401) {
        response = await fetch('http://localhost:8000/api/register/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: userName, email: userEmail}),
        });
      }
      if(response.ok)
        return true;
      else
        return false;
    }
  }
}