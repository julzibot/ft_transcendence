import type { Metadata } from "next";
import React from 'react';
import { Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css"
import SessionProvider from "../components/SessionProvider";
import { getServerSession } from "next-auth";
import Navbar from "../components/ui/navbar/Navbar";
import GameProvider from "./context/GameContext";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <SessionProvider session={session}>
        <GameProvider>
            <main>
              <Navbar />
              {children}
            </main>
          </GameProvider>
        </SessionProvider>
      </body>
    </html>
  );
}