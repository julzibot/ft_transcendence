"use client"

import { useRouter } from 'next/navigation'
import "bootstrap/dist/css/bootstrap.min.css"
import styles from './EndGameCard.module.css'
import { useState, useEffect } from 'react'

export default function EndGameCard() {
    const router = useRouter()
    const [show, setShow] = useState<Boolean>(false)
    // const [isMounted, setIsMounted] = useState<Boolean>(false)

    useEffect(() => {
        setTimeout(() => {
            setShow(true)
        }, 2000)
    },[])

    return (show && (
    <>
    <div className={`modal fade show d-block`} id="staticBackDrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={10}>
        <div className={`modal-dialog modal-dialog-centered`}>
            <div className={`modal-content ${styles.endGameCard}`}>
            <div className="modal-header justify-content-center">
                <div className="modal-title"> 
                    <h5>Game is over ! Click below to return to lobby</h5>
                    <h6>Or don't, I'm not your boss</h6>
                </div>
            </div>
            <div className="modal-footer justify-content-center">
                <button type="button" className="btn btn-outline-light" onClick={() => router.push('/game/simple')} data-bs-dismiss="modal">Return to Lobby</button>
            </div>
            </div>
        </div>
    </div>
    <div className="modal-backdrop fade show"></div>
    </>
  ))
}