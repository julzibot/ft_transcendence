"use client";

import 'bootstrap-icons/font/bootstrap-icons.css'
import { PersonDashFill, CircleFill, XCircleFill, Joystick, CheckCircleFill } from 'react-bootstrap-icons';
import { CustomTooltip } from '@/components/Utils/Tooltip';
import SearchPlayerInput from './SearchPlayerInput';
import { useEffect, useState } from 'react'
import { useAuth } from '@/app/lib/AuthContext';
import Image from "next/image";
import { Friendship, Friend } from '@/types/Friend';
import Link from 'next/link';
import { API_URL } from '@/config';
import Cookies from 'js-cookie';

export default function FriendList() {
	const { session } = useAuth()
	console.log({ session })
	const [friendships, setFriendships] = useState<Friendship[]>([])


	useEffect(() => {
		fetchFriends()
	}, [])

	async function fetchFriends() {
		const response = await fetch(`${API_URL}/friends/get/?id=${session?.user?.id}`, {
			method: 'GET',
			credentials: 'include',
		})
		const data = await response.json()
		setFriendships(data)
	}

	async function approveFriendRequest(friend: Friend) {
		const response = await fetch(`${API_URL}/friends/approve-friend-request/`, {
			method: 'PUT',
			credentials: 'include',
			headers: { 
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'X-CSRFToken': Cookies.get('csrftoken') as string
			},
			body: JSON.stringify({
				'approving_user_id': session?.user?.id,
				'pending_user_id': friend.id,
				'requestor_id': friend.id
			})
		})
		if (response.status === 202) {
			fetchFriends()
		}
	}

	async function deleteFriendship(friend: Friend) {
		const response = await fetch(`${API_URL}/friends/delete-friendship/`, {
			method: 'DELETE',
			credentials: 'include',
			headers: {
				'Accept': 'application/json', 
				'Content-type': 'application/json',
				'X-CSRFToken': Cookies.get('csrftoken') as string
		},
			body: JSON.stringify({
				'user_id1': session?.user?.id,
				'user_id2': friend.id
			})
		})
		if (response.status === 204)
			fetchFriends()
	}

	return (
		<>
			<SearchPlayerInput fetchFriends={fetchFriends} />

			<button
				className="btn btn-secondary btn-sm dropdown-toggle w-100 mt-3"
				type="button"
				data-bs-toggle="collapse"
				data-bs-target="#friendsCollapse"
				aria-expanded="false"
				aria-controls="friendsCollapse">
				Friends ({friendships.filter(friend => friend.friendship_status === 'FRIENDS').length})
			</button>

			<div id="friendsCollapse" className="collapse border border-bottom-0">
				{
					friendships.map((friendship) => (
						friendship.friendship_status === 'FRIENDS' && (
							<div key={friendship.user.id} className="d-flex flex-row align-items-center border-bottom">
								<div className="ms-2 me-2">

									{
										friendship.user.is_online ? <CircleFill color="green" size={12} /> : <CircleFill color="red" size={12} />
									}
								</div>
								<Link href={`/account/${friendship.user.id}`}>
									<div className="position-relative border border-1 border-dark-subtle rounded-circle me-3" style={{ width: '30px', height: '30px', overflow: 'hidden' }}>
										<Image
											style={{ objectFit: 'cover' }}
											alt="profile picture"
											src={`http://django:8000${friendship.user.image}`}
											fill
											sizes="20vw"
										/>
									</div>
								</Link>
								<span className="flex-grow-1 overflow-hidden  fs-4 fw-semibold text-truncate">
									{friendship.user.username}
								</span>
								<CustomTooltip text="Unfriend" position="top">
									<PersonDashFill className='me-2' size={35} role="button" onClick={() => deleteFriendship(friendship.user)} color="red" />
								</CustomTooltip>

							</div>
						)))
				}
			</div >

			<button
				className="btn btn-secondary btn-sm dropdown-toggle w-100 mt-3"
				type="button"
				data-bs-toggle="collapse"
				data-bs-target="#friendRequestsCollapse"
				aria-expanded="false"
				aria-controls="friendRequestsCollapse">
				Requests ({friendships.filter(friendship => friendship.friendship_status === 'REQUEST').length})
			</button>

			<div className="collapse border border-bottom-0" id="friendRequestsCollapse">
				{
					friendships.map((friendship) => (
						friendship.friendship_status === 'REQUEST' && (
							<div key={friendship.user.id} className="d-flex flex-row align-items-center border-bottom">
								<div className="ms-2 me-2">
									{
										friendship.user.is_online ? <CircleFill color="green" size={10} /> : <CircleFill color="red" size={10} />
									}
								</div>
								<Link href={`/account/${friendship.user.id}`}>
									<div className="me-3 position-relative border border-1 border-dark-subtle rounded-circle" style={{ width: '30px', height: '30px', overflow: 'hidden' }}>
										<Image
											style={{ objectFit: 'cover' }}
											alt="profile picture"
											src={`http://django:8000${friendship.user.image}`}
											fill
											sizes={"20vw"}
										/>
									</div>
								</Link>
								<div className='flex-grow-1 overflow-hidden'>

									<span className=" fs-4 fw-semibold text-truncate">
										{friendship.user.username}
									</span>
								</div>
								<div className="me-2">
									{
										(friendship.user.id === friendship.requestor) ? (
											<>
												<CustomTooltip text="Approuve Request" position="top">
													<CheckCircleFill size={35} role="button" onClick={() => approveFriendRequest(friendship.user)} className="me-1" color="green" />
												</CustomTooltip>
												<CustomTooltip text="Deny Request" position="top">
													<XCircleFill size={35} role="button" onClick={() => deleteFriendship(friendship.user)} color="red" />
												</CustomTooltip>
											</>
										) : (
											<CustomTooltip text="Cancel Request" position="top">
												<XCircleFill size={35} role="button" onClick={() => deleteFriendship(friendship.user)} color="red" />
											</CustomTooltip>
										)
									}
								</div>
							</div>
						)))
				}
			</div>
		</>
	)
}