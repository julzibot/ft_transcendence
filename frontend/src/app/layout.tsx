import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css"
import SessionProvider from "../components/SessionProvider";
import { getServerSession } from "next-auth";
import Navbar from "../components/ui/navbar/Navbar";

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
            <main>
              <Navbar />
              {children}
            </main>
        </SessionProvider>
      </body>
    </html>
  );
}