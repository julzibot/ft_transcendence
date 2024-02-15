import type {NextAuthOptions} from 'next-auth'
import FortyTwoProvider from "next-auth/providers/42-school";
//import CredentialsProvider from 'next-auth/providers/credentials';

export const options: NextAuthOptions = {
  providers: [
    FortyTwoProvider({
      clientId: process.env.FORTY_TWO_CLIENT_ID as string,
      clientSecret: process.env.FORTY_TWO_CLIENT_SECRET as string
    })
  ]
}