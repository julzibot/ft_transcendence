import { NextAuthOptions } from "next-auth";
import FortyTwoProvider from "next-auth/providers/42-school";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";

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
      id: '42-school',
      clientId: process.env.FORTY_TWO_CLIENT_ID as string,
      clientSecret: process.env.FORTY_TWO_CLIENT_SECRET as string,
      profile(profile) {
        return {
          id: profile.id,
          login: profile.login,
          nick_name: profile.first_name,
          email: profile.email,
          image_url: profile.image.versions.medium
        }
      }
    }),
    CredentialsProvider({
      id: 'credentials',
      name: "Credentials",
      credentials: {
          email: { label: "Email", type: "email", placeholder: "jdoe@example.com"},
          password: { label: "Password", type: "password"}
      },
      async authorize(credentials) {
        const res = await fetch(`${backend_url}/api/auth/signin/`, {
          method: "POST",
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({user: credentials})
        });
        if(res.ok) {
          const user = await res.json()
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
    async jwt({token, trigger, session, user, account}) {
      // if user is loging in, call backend api that returns user info and backend token)
      if(user) {
        let backendUrl
        if (account?.provider === '42-school')
          backendUrl = `${backend_url}/api/auth/oauth/`
        else
          backendUrl = `${backend_url}/api/auth/access_token/`
        const res = await fetch(backendUrl, {
          method: "POST",
          headers: {"Content-type": "application/json"},
          body: JSON.stringify({user})
        })
        if (res.ok)
        {
          token = await res.json()
          return token
        }
      }
      if(trigger === 'update' && session?.name) {
        token.name = session.name
        token.image = session.image
      }
      if(new Date().getTime() / 1000 < token.backendTokens.expiresIn) {
        return token
      }
      return await refreshToken(token)
    },

    async session({session, token}) {
      //call user api to get user informations
      const response = await fetch(`${backend_url}/api/auth/user/`, { 
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
