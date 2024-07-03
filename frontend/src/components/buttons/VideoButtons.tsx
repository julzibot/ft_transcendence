import { useRef } from 'react'
import styles from './VideoButton.module.css'

export default function VideoButton({src, gameName}) {
  const videoRef = useRef(null)

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

  console.log(src)
  return (
    <>
      <button
        className={styles.videoButton}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles.videoContainer}>
          <video ref={videoRef} className={styles.video} loop muted>
            <source src={src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </button>
    </> 
  )
}