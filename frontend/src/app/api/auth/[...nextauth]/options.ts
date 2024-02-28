import { log } from 'console';
import type {NextAuthOptions} from 'next-auth'
import FortyTwoProvider from "next-auth/providers/42-school";
import { signOut } from 'next-auth/react';

export const authOptions: NextAuthOptions = {
  providers: [
    FortyTwoProvider({
      clientId: process.env.FORTY_TWO_CLIENT_ID as string,
      clientSecret: process.env.FORTY_TWO_CLIENT_SECRET as string,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.login,
          email: profile.email,
          image: profile.image.versions.medium
        }
      }
    }),
  ],

  callbacks: {
    async jwt({token, trigger, session, user}) {
      // if user is loging in, call backend api that returns user info and backend token
      if(user) {
        const response = await fetch('http://localhost:8000/api/signin/', {
          method: "POST",
          headers: {"Content-type": "application/json"},
          body: JSON.stringify({
            'user': user
          })
        })
        if (response.ok)
        {
          const newUser = await response.json()
          token = newUser
        }
      }

      if(trigger === 'update' && session?.name) {
        token.name = session.name
      }
      return token
    },

    async session({session, token}) {
      //call user api to get user informations
      const response = await fetch('http://localhost:8000/api/user/', {
        method: "GET",
        headers: {'Authorization': `Bearer ${token.backendTokens.access}`},
      })
      if(response.ok) {
        session.user = await response.json()
      }
      return session
    }
  }
}