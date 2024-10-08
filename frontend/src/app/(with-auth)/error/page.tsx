"use client";

import {useSearchParams} from 'next/navigation'
import Link from 'next/link'
import {ConeStriped, ExclamationCircleFill} from 'react-bootstrap-icons'

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  function Error() {
  switch (code) {
    case '404':
      return "Oops you are lost"
      break;
    case '400':
      return "Bad Request"
      break;
    default:
      return "An error occurred"
      break;
  }
  }

  return (
    <div className="d-flex flex-column justify-content-center align-items-center mt-5 pt-5">
        <ConeStriped size={100} className="text-danger"/>
        <div className="text-light d-flex flex-row align-items-center justify-content-center">
          <h2 className="fw-bold">{code} | </h2>
          <h3 className="ms-2">{Error()} </h3>
        </div>
        <Link href="/">
          <button className="btn btn-danger btn-sm">
            Bring me back to safety 
          </button>
        </Link>
    </div>
  )
}