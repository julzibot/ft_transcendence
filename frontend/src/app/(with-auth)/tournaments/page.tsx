"use client";

import Tournament from "@/components/Tournament";
import { useAuth } from "@/app/lib/AuthContext";
import { useEffect, useState } from "react"
import './styles.css'
import styles from './GameSettingsStyles.module.css'
import { Toast, ToastContainer } from 'react-bootstrap'

export default function TournamentsPage() {

  const { session } = useAuth();

  const [isTranslated, setIsTranslated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [toastShow, setToastShow] = useState<Boolean>(false)
  const [errorField, setErrorField] = useState({
    joinError: '',
    nameMissing: '',
    difficultyMissing: '',
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 1000);
    return () => clearTimeout(timer)
  }, []);

  return (
    <>
        <div className="d-flex flex-column align-items-center justify-content-center">
          <div className={`card mt-1 mb-4 m-2 p-1 ps-4 pe-4  ${styles.pageTitle} ${isMounted ? styles.mounted : ''}`}>
            <div className="card-title">
              <h2 className="mt-3">Tournaments</h2>
            </div>
          </div>
        </div>
        <div className="d-flex justify-content-center">
          <div className={`card mt-3 col-6 ${styles.gameSettingsCard} ${isTranslated ? styles.translated : ''} ${isMounted ? styles.mounted : ''}`}>
            <div className="card-body">
            <Tournament
              setToastShow={setToastShow}
              setErrorField={setErrorField}
              errorField={errorField}
                />
            </div>
          </div>
        </div>
        <ToastContainer
          className="p-3"
          position='bottom-end'
          style={{ zIndex: 1 }}
        >
          <Toast
            onClose={() => setToastShow(false)}
            show={toastShow}
            delay={5000}
            autohide
            bg={'danger'}
          >
            <Toast.Header className="text-danger">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <strong className="ms-1 me-auto">Failed To Join</strong>
            </Toast.Header>
            <Toast.Body className="text-light">{errorField.joinError}</Toast.Body>
          </Toast>
        </ToastContainer>
    </>
  );
}