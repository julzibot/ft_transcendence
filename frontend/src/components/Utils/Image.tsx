import { BACKEND_URL } from '../../config'
import { Spinner } from 'react-bootstrap'

export default function Image({ className, src, alt, whRatio, loading}: {className?: string, src: string | null | undefined, alt: string, whRatio: string, loading?: boolean}) {
  return (
    <>
  {
        !loading && src ? (
        <>
      <div className={`position-relative border border-2 border-dark-subtle rounded-circle ${className}`} style={{ width: whRatio, height: whRatio, overflow: 'hidden'}}>
      <img
      style={{
        objectFit: 'cover',
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }}
      fetchPriority="high"
      alt={alt}
      src={`${src.startsWith("/static") ? "" : BACKEND_URL}${src}`}
      />
  </div>
    </>) : (<>
      <Spinner className="border-dark-subtle border-2" animation="border" style={{ width: whRatio, height: whRatio, borderRight: "none", borderLeft: "none", borderTopColor: 'white', borderBottom: "none", animationDuration: "1.2s" }} />
    </>									
      
    )
  }
  </>  )           
}