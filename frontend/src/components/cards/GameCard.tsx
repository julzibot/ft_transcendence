import { useRouter } from 'next/navigation'
import styles from './GameCard.module.css'
import { useState } from 'react'

export default function GameCard({src}) {
  const router = useRouter()
  const [move, setMove] = useState(false)
  const [direction, setDirection] = useState('')

  const handleSingleButton = () => {
    setMove(!move)
    setDirection(styles.left)
    // const timer = setTimeout(() => {
    //   router.push('/game/simple')
    // }, 500);
  }

  const handleTournamentsButton = () => {
    setMove(!move)
    setDirection(styles.right)
    // const timer = setTimeout(() => {
    //   router.push('/game/tournaments')
    // }, 500);
  }

  return (
    <>
      <div className={`${styles.gameCard} ${move ? direction : ''}`}>
        <h1 className="text-center fw-bold text-light  mt-4">Welcome</h1>
        <hr className={styles.whiteLine}/>
        <div className={styles.videoContainer}>
          <video  className={styles.video} autoPlay loop muted>
            <source src={src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="align-items-center justify-content-evenly d-flex mt-5">
          <button className="btn btn-outline-light btn-lg" onClick={handleSingleButton}>Simple Game</button>
          <button className="btn btn-outline-light btn-lg" onClick={handleTournamentsButton}>Tournaments</button>
        </div>
      </div>
    </> 
  )
}