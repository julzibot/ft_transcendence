import { NextAuthOptions } from "next-auth";
import FortyTwoProvider from "next-auth/providers/42-school";
import CredentialsProvider from "next-auth/providers/credentials";

async function refreshToken(token: JWT): Promise<JWT> {
  const response = await fetch ('http://localhost:8000/api/refresh/', {
    method: "POST",
    headers: {authorization: `Refresh ${token.backendTokens.refresh}`},
  });
  const newToken = await response.json()
  return {
    ...token,
    backendTokens: newToken,
  }
}

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
    CredentialsProvider({
      name: "Email",
      credentials: {
        name: { label: "Name", type: "text", placeholder: "Will be displayed to other players" },
        email: { label: "Email", type: "email", placeholder: "jdoe@example.com"},
        password: { label: "Password", type: "password" },
        password2: { label: "Confirm Password", type: "password"}
        },
      async authorize(credentials, req) {
        const { name, email, password, password2} = credentials
        if(password != password2) {
          return null
        }
        const response = await fetch('http://localhost:8000/api/signup/', {
          method: "POST",
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            name,
            email,
            password
          })
        });
        if(response.ok) {
          const user = await response.json()
          return user
        }
        return null
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
          return newUser
        }
      }
      if(trigger === 'update' && session?.name) {
        token.name = session.name
      }
      if(new Date().getTime() / 1000 < token.backendTokens.expiresIn) {
        return token
      }
      return await refreshToken(token)

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