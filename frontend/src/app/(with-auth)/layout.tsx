import type { Metadata } from "next";
import React from 'react';
import { Roboto } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css"
import Navbar from "@/components/ui/navbar/Navbar";
import Sidenav from "@/components/ui/sidenav/Sidenav";
import { AuthProvider } from "../lib/AuthContext";
import '../global.css';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className={roboto.className}>
          <main>
        <AuthProvider>
            <Sidenav />
            <Navbar />
            {children}
        </AuthProvider>
          </main>
      </body>
    </html>
  );
}