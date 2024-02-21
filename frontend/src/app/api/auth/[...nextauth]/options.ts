import type {NextAuthOptions} from 'next-auth'
import FortyTwoProvider from "next-auth/providers/42-school";

export const options: NextAuthOptions = {
  providers: [
    FortyTwoProvider({
      clientId: process.env.FORTY_TWO_CLIENT_ID as string,
      clientSecret: process.env.FORTY_TWO_CLIENT_SECRET as string,
    }),
  ],

  callbacks: {
    async signIn({user}) {
     const {name, email} = user
      let response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email}),
      });

      if(response.status === 401) {
        response = await fetch('http://localhost:8000/api/register/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email}),
        });
      }
      user = await response.json();
      console.log(user)
      return user
    },

    async jwt({token, user}) {
      // console.log(user)
      return token
    }
  }
}