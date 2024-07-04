import { useRef } from 'react'
import styles from './GameCard.module.css'

export default function GameCard({src, gameName, position, move, onClick}) {
  const videoRef = useRef(null)

  const direction = position === 'left' ? styles.left : styles.right;


  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };


  return (
    <>
      <div
        className={`${styles.gameCard} ${move ? direction : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <h1 className="text-center fw-bold text-light  mt-4">{gameName}</h1>
        <hr className={styles.whiteLine}/>
        <div className={styles.videoContainer}>
          <video ref={videoRef} className={styles.video} loop muted>
            <source src={src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="align-items-center justify-content-evenly d-flex mt-5">
          <button className="btn btn-outline-light btn-lg" onClick={onClick}>Play Locally</button>
          <button className="btn btn-outline-light btn-lg" onClick={onClick}>Play Online</button>
        </div>
      </div>
    </> 
  )
}