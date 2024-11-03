import Link from 'next/link'
import { ConeStriped } from 'react-bootstrap-icons'

export default function ErrorPage() {

  return (
    <div className="d-flex flex-column justify-content-center align-items-center mt-5 pt-5">
      <ConeStriped size={100} className="text-danger" />
      <div className="text-light d-flex flex-row align-items-center justify-content-center">
        <h2 className="fw-bold">404 | </h2>
        <h3 className="ms-2">The Page you are looking for does not exists</h3>
      </div>
      <Link href="/">
        <button className="btn btn-danger btn-sm">
          Bring me back to safety
        </button>
      </Link>
    </div>
  )
}