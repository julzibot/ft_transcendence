import type { Metadata } from "next";
import React from 'react';
import { Roboto } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css"
import SessionProvider from "../components/SessionProvider";
import { getServerSession } from "next-auth";
import Navbar from "../components/ui/navbar/Navbar";
import Sidenav from "@/components/ui/sidenav/Sidenav";
import './global.css';

const roboto = Roboto({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "ft_transcendence",
  description: "An online pong game",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
 
  return (
    <html lang="en">
      <body className={roboto.className}>
        <SessionProvider session={session}>
            <main>
              <Navbar />
              {/* <div className="" style={{top: '0px', left: '0px', height: '1080px', width: '1920px', position: 'relative'}}>
                <Image
                  className="z-n1"
                  src={background}
                  alt="background"
                  sizes="100vw"
                  fill
                  object-fit="cover"
                  priority={true}
                  />
              </div> */}
              {children}
              <Sidenav />
            </main>
        </SessionProvider>
      </body>
    </html>
  );
}