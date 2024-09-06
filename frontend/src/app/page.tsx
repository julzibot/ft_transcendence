"use client";

import GameCard from '@/components/cards/GameCard';
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'


export default function Home() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated')
      router.push('/auth/signin')
  }, [])

  return (
    <>
      <div className="d-flex flex-row justify-content-center mt-5 pt-5">
        <GameCard src="/pong.mov" />
      </div>
    </>
  )
}
