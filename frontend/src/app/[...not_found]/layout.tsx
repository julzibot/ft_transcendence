import type { Metadata } from "next";
import React from 'react';
import { Inter } from "next/font/google";
import { AuthProvider } from "../lib/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css"
import Sidenav from "@/components/ui/sidenav/Sidenav";
import Navbar from "@/components/ui/navbar/Navbar";
import '../global.css';

const inter = Inter({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ft_transcendence",
  description: "An online pong game",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <main>
          <AuthProvider>
            <Navbar />
            <Sidenav />
            {children}
          </AuthProvider>
        </main>
      </body>
    </html>
  );
}