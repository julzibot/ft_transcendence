import type {NextAuthOptions} from 'next-auth'
import FortyTwoProvider from "next-auth/providers/42-school";

export const authOptions: NextAuthOptions = {
  providers: [
    FortyTwoProvider({
      clientId: process.env.FORTY_TWO_CLIENT_ID as string,
      clientSecret: process.env.FORTY_TWO_CLIENT_SECRET as string,
    }),
  ],

  callbacks: {
    async jwt({token, user}) {
      if(user)
        return {...token, ...user}
      return token
    },

    async session({session, token}) {
      const {name, email} = session.user
      let response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify({name, email}),
      });
      if(response.status === 401) {
        response = await fetch('http://localhost:8000/api/register/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({name, email}),
      });
      if(response.ok) {
        response = await fetch('http://localhost:8000/api/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email}),
        });
      }
      }
      const newRes = await response.json()
      session.user = newRes.user
      session.backendTokens = newRes.backendTokens
      return session
    }
  }
}