import type { Metadata } from "next";
import React from 'react';
import { Roboto } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css"
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
  icons: {
    icon: '/favicon.ico',
  },
};

export default function AuthLayout({ children }: {children: React.ReactNode}) {

  return (
    <html lang="en">
      <body className={roboto.className}>
          <main>
        <AuthProvider>
            {children}
        </AuthProvider>
          </main>
      </body>
    </html>
  );
}