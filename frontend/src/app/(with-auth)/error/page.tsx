"use client";

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ConeStriped } from 'react-bootstrap-icons'

function ErrorContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  function Error() {
    switch (code) {
      case '404':
        return "Oops you are lost"
      case '403':
        return "You are not allowed to come here."
      case '400':
        return "Bad Request"
      default:
        return "An error occurred"
    }
  }

  return (
    <div className="text-light d-flex flex-row align-items-center justify-content-center">
      <h2 className="fw-bold">{code} | </h2>
      <h3 className="ms-2">{Error()} </h3>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center mt-5 pt-5">
      <ConeStriped size={100} className="text-danger" />
      <ErrorContent />
      <Link href="/">
        <button className="btn btn-danger btn-sm">
          Bring me back to safety
        </button>
      </Link>
    </div>
  )
}