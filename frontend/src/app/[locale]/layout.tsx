import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css"
// import { NextIntlClientProvider, useMessages } from 'next-intl';
import SessionProvider from "../../components/SessionProvider";
import { getServerSession } from "next-auth";
import Navbar from "@/components/ui/navbar/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ft_transcendence",
  description: "An online pong game",
};

export default async function RootLayout({
  children,
  params: { locale}
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string};
}>) {
  // const messages = useMessages();
  const session = await getServerSession();
 
  return (
    <html lang={locale}>
      <body className={inter.className}>
        {/* <NextIntlClientProvider locale={locale} messages={messages}> */}
          <SessionProvider session={session}>
            <main>
              <Navbar />
              {children}
            </main>
          </SessionProvider>
        {/* </NextIntlClientProvider> */}
      </body>
    </html>
  );
}