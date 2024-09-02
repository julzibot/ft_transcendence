"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useState, FormEvent, useEffect } from "react";
import ImageUpload from "@/components/Utils/ImageUpload";
import DOMPurify from 'dompurify'
import UserDashboardCard from "@/components/ui/dashboard/UserDashboardCard"
import Customization from "@/components/game/Customization";
import { useParams, useRouter } from "next/navigation";

interface User {
	id: number;
	username: string;
	image: string;
}

export default function ProfilePage() {
	const [isEditing, setIsEditing] = useState(false)
	const { data: session, update } = useSession();
	const { id } = useParams()
	const router = useRouter()
	const [user, setUser] = useState<any>({
		id: 0,
		username: '',
		image: '',
	})
	const [showModal, setShowModal] = useState<boolean>(false)
	const [isEditPw, setIsEditPw] = useState(false)
	const initialState = {
		username: '',
		oldPassword: '',
		newPassword: '',
		rePassword: '',
		usernameError: '',
		error: '',
	}
	const [data, setData] = useState({
		username: '',
		oldPassword: '',
		newPassword: '',
		rePassword: '',
		usernameError: '',
		error: '',
	})

	const [gameSettings, setGameSettings] = useState({
		background: 0, // 0 - 3 animated, 4 - 5 static
		palette: 0, // palette: 4 choices
		bgColor: '#ff0000',
		opacity: 80,
		sparks: true,

		game_difficulty: 4,
		points_to_win: 5,
		power_ups: true
	});

	const handleShow = () => {
		setShowModal(true);

		setTimeout(() => {
			setShowModal(false);
		}, 2000);
	};

	async function getUserInfo() {
		const response = await fetch(`http://c2r4p9.42nice.fr:8000/api/user/get-user-info/?id=${id}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		})
		if (!response.ok) {
			router.push(`/${id}`)
			return;
		}
		const data = await response.json()
		setUser({
			id: data.user.id,
			username: data.user.username,
			image: data.user.image
		})
	}

	async function changePassword(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()

		const response = await fetch('http://c2r4p9.42nice.fr:8000/api/update/password/', {
			method: 'PUT',
			headers: { 'Content-type': 'application/json' },
			body: JSON.stringify({
				'user_id': session?.user.id,
				'old_password': data.oldPassword,
				'new_password': data.newPassword,
				'rePass': data.rePassword
			})
		})
		const message = await response.json()
		if (!response.ok)
			setData({ ...data, error: message.message })
		else {
			setIsEditPw(false)
			handleShow()
			setData(initialState)
		}
	}

	async function updateUsername(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (data.username.length > 20) {
			setData({ ...data, usernameError: 'Username is too long' })
			return;
		}

		const response = await fetch('http://c2r4p9.42nice.fr:8000/api/update/name/', {
			method: 'PUT',
			headers: { 'Content-type': 'application/json' },
			body: JSON.stringify({
				'email': session?.user.email,
				'name': data.username
			})
		})
		if (response.ok) {
			update({ username: data.username })
			setIsEditing(false);
		}
		else {
			const res = await response.json()
			setData({ ...data, usernameError: res.message })
		}
		setIsEditing(false);
	}


	async function deleteAccount() {
		const response = await fetch('http://c2r4p9.42nice.fr:8000/api/auth/user/delete/', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				'user_id': session?.user.id,
			})
		})
		if (response.status === 204) {
			signOut({ "callbackUrl": '/auth/signin' })
		}
		else {
			const res = await response.json()
			setData({ ...data, error: res.message })
		}
	}

	useEffect(() => {
		getUserInfo()
		setData(initialState)
	}, [update])

	return (
		<>
			<div className="d-flex flex-row align-items-center justify-content-evenly">
				<div className="card flex-column shadow-lg text-center bg-light ms-5">
					<div className="card-body">
						<div className="position-relative border border-4 border-dark-subtle rounded-circle" style={{ width: '280px', height: '280px', overflow: 'hidden' }}>
							{
								user.image ? (
									<>
										<Image style={{ objectFit: 'cover' }}
											fill
											src={`http://backend:8000${user.image}`}
											alt="Profile Picture"
											priority={true}
											sizes="25vw"
										/>
									</>
								) : (
									<div className="placeholder-glow w-100 h-100">
										<div className="placeholder bg-secondary w-100 h-100"></div>
									</div>
								)
							}
						</div>
						<br />
						{
							session?.user.id === Number(id) ? (
								<>
									<ImageUpload />

									{
										isEditing ? (
											<>
												<form onSubmit={updateUsername}>
													<input type="text" className="form-control form-control-sm mb-2" placeholder="New Username" value={data.username} onChange={(e) => setData({ ...data, username: DOMPurify.sanitize(e.target.value) })} />
													<button type="submit" className="btn btn-primary btn-sm rounded-pill">Submit</button>
													<button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary rounded-pill btn-sm">Cancel</button>
												</form>
											</>
										) : (
											<>
												<div className="d-flex flex-row align-items-center justify-content-between">
													{
														session.user.username ? (<span className="flex-grow-1 overflow-hidden text-truncate fw-semibold fs-4">{session.user.username}</span>) : (
															// Display placeholder if username is not set
															<>
																<p className="card-text fs-4 placeholder-glow">
																	<span className="placeholder col-7"></span>
																</p>

															</>
														)
													}
													{
														session.user.id ? (<button className=" btn btn-sm btn-primary rounded-pill" onClick={() => setIsEditing(true)}>Edit</button>) : (
															<a className="btn btn-sm btn-primary rounded-pill disabled placeholder" aria-disabled="true">Edit</a>
														)
													}
												</div>
											</>
										)
									}
									<div className="text-danger">{data.usernameError}</div>
								</>
							) : (
								<>
									{
										user.username ? (<span className="flex-grow-1 overflow-hidden text-truncate fw-semibold fs-4">{user.username}</span>) : (
											<>
												<p className="card-text fs-4 placeholder-glow">
													<span className="placeholder col-7"></span>
												</p>
											</>
										)
									}
								</>
							)
						}
						<hr />
						{
							session?.user.id == Number(id) ? (
								<>
									{
										session?.user.email ? (<span className="card-subtitle text-body-secondary fw-semibold">{session?.user.email}</span>) : (
											<p className="card-subtitle placeholder-glow">
												<span className="placeholder col-7"></span>
											</p>
										)
									}
									<hr />
									{
										session?.user.id ? <Customization updateSettings={setGameSettings} gameSettings={gameSettings} userId={session.user.id} /> : (
											<a className="btn btn-primary rounded-pill disabled placeholder" aria-disabled="true">Game Customization</a>
										)
									}
									{
										session?.provider !== '42-school' && (
											<>
												<hr />
												<div className="d-flex flex-row justify-content-center align-items-center">
													{
														isEditPw ? (
															<>
																<form onSubmit={changePassword}>
																	<input placeholder="Current Password" className="form-control form-control-sm" type="password" value={data.oldPassword} onChange={(e) => setData({ ...data, oldPassword: DOMPurify.sanitize(e.target.value) })} />
																	<input placeholder="New Password" className="form-control form-control-sm" type="password" value={data.newPassword} onChange={(e) => setData({ ...data, newPassword: DOMPurify.sanitize(e.target.value) })} />
																	<input placeholder="Confirm Password" className="form-control form-control-sm" type="password" value={data.rePassword} onChange={(e) => setData({ ...data, rePassword: DOMPurify.sanitize(e.target.value) })} />
																	<button type="submit" className="btn btn-primary btn-sm rounded-pill">Submit</button>
																	<button type="button" onClick={() => setIsEditPw(false)} className="btn btn-secondary rounded-pill btn-sm">Cancel</button>
																	<div className="form-text text-danger">{data.error}</div>
																</form>
															</>
														) : (
															<>
																{
																	session?.user.id ? (<button className='btn btn-primary btn-sm rounded-pill' onClick={() => setIsEditPw(true)}>Change Password</button>) : (
																		<a className='btn btn-primary btn-sm rounded-pill disabled placeholder' aria-disabled="true">Change Password</a>
																	)
																}
															</>
														)
													}
												</div>
											</>)
									}
									<hr />
									{
										session?.user.id ? (
											<button type="button" className="btn btn-danger rounded-pill" data-bs-toggle="modal" data-bs-target="#staticBackdrop">Delete Account</button>
										) : (
											<a className='btn btn-danger rounded-pill disabled placeholder' aria-disabled="true">Delete Account</a>
										)
									}
								</>
							) : (<></>)
						}
					</div>
				</div>
				{
					user && <UserDashboardCard user={user} />
				}
			</div >


			<div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby="staticBackdropLabel" aria-hidden="true">
				<div className="modal-dialog modal-dialog-centered">
					<div className="modal-content">
						<div className="modal-header">
							<h1 className="modal-title fs-5" id="staticBackdropLabel">We are sad to see you leaving 😔</h1>
							<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">I Changed My Mind</button>
							<button type="submit" onClick={deleteAccount} className="btn btn-danger">See You</button>
						</div>
					</div>
				</div>
			</div>

			<div className={`modal fade ${showModal ? 'show' : ''}`}
				id="pwConfirmation"
				data-bs-backdrop="static"
				data-bs-keyboard="false"
				tabIndex={-1}
				aria-labelledby="pwConfirmation"
				style={{ display: showModal ? 'block' : 'none' }}
				aria-hidden="true">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h1 className="modal-title fs-5" id="staticBackdropLabel">Your password has been changed successfully !</h1>
							<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setShowModal(false)}></button>
						</div>
					</div>
				</div>
			</div>
		</>
	)
};



