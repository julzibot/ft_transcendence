import { NextAuthOptions } from "next-auth";
import FortyTwoProvider from "next-auth/providers/42-school";
import CredentialsProvider from "next-auth/providers/credentials";

const backend_url = process.env.BACKEND_URL

async function refreshToken(token: JWT): Promise<JWT> {
  const response = await fetch (`${backend_url}/api/refresh/`, {
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
          login: profile.login,
          nick_name: profile.first_name,
          email: profile.email,
          image: profile.image.versions.medium
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jdoe@example.com"},
        password: { label: "Password", type: "password"}
      },
      async authorize(credentials, req) {
        console.log({credentials, req})
        const response = await fetch(`${backend_url}/api/signup/`, {
          method: "POST",
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({credentials})
        });
        if(response.ok) {
          const user = await response.json()
          return user
        }
        return null
      }
    }),
  ],

  pages: {
    signIn: "/auth/signin"
  },

  callbacks: {
    async jwt({token, trigger, session, user}) {
      // if user is loging in, call backend api that returns user info and backend token
      if(user) {
        const response = await fetch(`${backend_url}/api/signin/`, {
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
      const response = await fetch(`${backend_url}/api/user/`, { 
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