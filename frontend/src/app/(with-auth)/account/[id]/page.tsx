"use client";

import { useAuth } from "@/app/lib/AuthContext";
import React, { useState, FormEvent, useEffect } from "react";
import ImageUpload from "@/components/Utils/ImageUpload";
import DOMPurify from 'dompurify'
import UserDashboardCard from "@/components/ui/dashboard/UserDashboardCard"
import Customization from "@/components/game/Customization";
import { useParams, useRouter } from "next/navigation";
import { BACKEND_URL } from "@/config";
import Cookies from "js-cookie";
import Image from "@/components/Utils/Image";
import { ChangeUsernameFormSchema, ChangeUsernameFormState } from "@/app/lib/definitions";

interface User {
	id: number;
	username: string;
	image: string;
}

export default function ProfilePage() {
	const [isEditing, setIsEditing] = useState<boolean>(false)
	const { session, update } = useAuth();
	const { id } = useParams()
	const router = useRouter()
	const [user, setUser] = useState<User>({
		id: 0,
		username: '',
		image: '',
	})
	const [showModal, setShowModal] = useState<boolean>(false)
	const [loading, setLoading] = useState<boolean>(false)
	const [isEditPw, setIsEditPw] = useState<boolean>(false)
	const [formState, setFormState] = useState<ChangeUsernameFormState | undefined>(undefined)
	const initialState = {
		username: '',
		oldPassword: '',
		newPassword: '',
		rePassword: '',
		error: '',
	}
	const [data, setData] = useState({
		username: '',
		oldPassword: '',
		newPassword: '',
		rePassword: '',
		error: '',
	})

	const handleShow = () => {
		setShowModal(true);

		setTimeout(() => {
			setShowModal(false);
		}, 2000);
	};

	async function getUserInfo() {
		if (!id || !/^\d+$/.test(id as string)) {
			router.replace(`/error?code=400`)
			return
		}
		const response = await fetch(`${BACKEND_URL}/api/user/get-user-info/?id=${id}`, {
			method: 'GET',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' }
		})
		if (!response.ok) {
			router.replace(`/error?code=${response.status}`)
			return
		}
		const data = await response.json()
		setUser({
			id: data.user.id,
			username: data.user.username,
			image: data.user.image
		})
	}

	async function changePassword(event: FormEvent<HTMLFormElement>) {
		setLoading(true)
		event.preventDefault()

		const response = await fetch(`${BACKEND_URL}/api/update/password/`, {
			method: 'PUT',
			credentials: 'include',
			headers: {
				'Content-type': 'application/json',
				'X-CSRFToken': Cookies.get('csrftoken') as string
			},
			body: JSON.stringify({
				'user_id': session?.user?.id,
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
		setLoading(false)
	}

	async function updateUsername(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget)
		const validatedFields = ChangeUsernameFormSchema.safeParse({
			username: formData.get('username'),
		})
		if (!validatedFields.success) {
			setFormState({ errors: validatedFields.error.flatten().fieldErrors })
		}
		else {
			const { username } = validatedFields.data
			const response = await fetch(`${BACKEND_URL}/api/update/name/`, {
				method: 'PUT',
				credentials: 'include',
				headers: {
					'X-CSRFToken': Cookies.get('csrftoken') as string,
					'Content-type': 'application/json'
				},
				body: JSON.stringify({
					'username': session?.user?.username,
					'name': username
				})
			})
			if (response.ok) {
				setIsEditing(false);
				update()
			}
			else {
				const res = await response.json()
				setFormState({ message: res.error })
			}
		}
		setIsEditing(false);
	}


	async function deleteAccount() {
		const response = await fetch(`${BACKEND_URL}/api/auth/user/delete/`, {
			method: 'DELETE',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': Cookies.get('csrftoken') as string
			},
			body: JSON.stringify({
				'user_id': session?.user?.id,
			})
		})
		if (response.status === 204) {
			router.replace('/auth/signin')
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
						<Image src={user.image} alt="profile picture" whRatio="280px" loading={loading} />
						<br />
						{
							session?.user?.id === Number(id) ? (
								<>
									<ImageUpload />

									{
										isEditing ? (
											<>
												<form onSubmit={updateUsername}>
													<input
														type="text"
														required
														name="username"
														id="username"
														className="form-control form-control-sm mb-2"
														placeholder="New Username"
													// value={data.username}
													// onChange={(e) => setData({ ...data, username: DOMPurify.sanitize(e.target.value) })} 
													/>
													<button type="submit" className="btn btn-primary btn-sm rounded-pill">Submit</button>
													<button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary rounded-pill btn-sm">Cancel</button>
												</form>
											</>
										) : (
											<>
												<div className="d-flex flex-row align-items-center justify-content-between">
													{
														session.user.username ? (<span className="flex-grow-1 overflow-hidden text-truncate fw-semibold fs-4">{session.user.username}</span>) : (
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
									{formState?.errors?.username && formState?.errors?.username.map((error, index) => (
										<div className="form-label" key={index}>{error}</div>)
									)}
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
							session?.user?.id == Number(id) ? (
								<>
									<Customization />
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
																	<input placeholder="New Password" className="mt-1 form-control form-control-sm" type="password" value={data.newPassword} onChange={(e) => setData({ ...data, newPassword: DOMPurify.sanitize(e.target.value) })} />
																	<input placeholder="Confirm Password" className="mt-1 form-control form-control-sm" type="password" value={data.rePassword} onChange={(e) => setData({ ...data, rePassword: DOMPurify.sanitize(e.target.value) })} />
																	<button type="submit" disabled={loading} className=" mt-3 me-2 btn btn-primary btn-sm rounded-pill">Submit</button>
																	<button type="button" disabled={loading} onClick={() => setIsEditPw(false)} className="mt-3 btn btn-secondary rounded-pill btn-sm">Cancel</button>
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
					user?.id && <UserDashboardCard user={user} />
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
							<button data-bs-dismiss="modal" onClick={deleteAccount} className="btn btn-danger">See You</button>
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



