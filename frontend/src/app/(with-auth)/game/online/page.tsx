"use client";

import Lobby from "@/components/Lobby";
import { useEffect, useState } from "react"
import './styles.css'
import styles from './GameSettingsStyles.module.css'
import { Toast, ToastContainer } from 'react-bootstrap'

export default function OnlineGamePage() {


	const [isTranslated, setIsTranslated] = useState<boolean>(false);
	const [isMounted, setIsMounted] = useState<boolean>(false);
	const [toastShow, setToastShow] = useState<boolean>(false)
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
						<h2 className="mt-3">Online Games</h2>
					</div>
				</div>
			</div>
			<div className="d-flex justify-content-center">
				<div className={`card mt-3 col-6 ${styles.gameSettingsCard} ${isTranslated ? styles.translated : ''} ${isMounted ? styles.mounted : ''}`}>
					<div className="card-body">
						<Lobby
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