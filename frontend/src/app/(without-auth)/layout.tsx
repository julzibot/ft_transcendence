import type { Metadata } from "next";
import React from 'react';
import { Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css"
import { AuthProvider } from "../lib/AuthContext";
import '../global.css';

const inter = Inter({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: "ft_transcendence",
  description: "An online pong game",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <main>
          <AuthProvider>
            {children}
          </AuthProvider>
        </main>
      </body>
    </html>
  );
}