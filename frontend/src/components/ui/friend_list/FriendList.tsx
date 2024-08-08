"use client";

import 'bootstrap-icons/font/bootstrap-icons.css'
import { PersonDashFill, CircleFill, XCircleFill, Joystick, CheckCircleFill } from 'react-bootstrap-icons';
import { CustomTooltip } from '@/components/Utils/Tooltip';
import SearchPlayerInput from './SearchPlayerInput';
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from "next/image";
import { Friendship, Friend } from '@/types/Friend';

export default function FriendList() {
	const { data: session } = useSession()
	const [friendships, setFriendships] = useState<Friendship[]>([])


	useEffect(() => {
		fetchFriends()
	}, [])

	async function fetchFriends() {
		const response = await fetch(`http://localhost:8000/api/friends/get/?id=${session?.user.id}`, {
			method: 'GET'
		})
		const data = await response.json()
		setFriendships(data)
	}

	async function approveFriendRequest(friend: Friend) {
		const response = await fetch(`http://localhost:8000/api/friends/approve-friend-request/`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				'approving_user_id': session?.user.id,
				'pending_user_id': friend.id,
				'requestor_id': friend.id
			})
		})
		if (response.status === 202) {
			fetchFriends()
		}
	}

	async function deleteFriendship(friend:Friend) {
		const response = await fetch('http://localhost:8000/api/friends/delete-friendship/', {
			method: 'DELETE',
			headers: { 'Content-type': 'application/json' },
			body: JSON.stringify({
				'user_id1': session?.user.id,
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
								<div key={friendship.user.id} className="container">
									<div className="row justify-content-around align-items-center p-2 border-bottom">
										<div className="col-1">
											{
												friendship.user.is_online ? (
													<CircleFill color="green" size={12} />
												) : (
													<CircleFill color="red" size={12} />
												)
											}
										</div>
										<div className="col-auto">
											<div className="position-relative border border-1 border-dark-subtle rounded-circle" style={{ width: '30px', height: '30px', overflow: 'hidden' }}>
												<Image
													style={{objectFit: 'cover'}}
													alt="profile picture"
													src={`http://backend:8000${friendship.user.image}`}
													fill
													sizes="20vw"
												/>
											</div>
										</div>
										<div className="col overflow-hidden">
											<span className="d-block fs-4 fw-semibold text-truncate">
												{friendship.user.username}
											</span>
										</div>
										<div className="col-auto">
											<CustomTooltip text="Invite to Play" position="top">
												<Joystick size={35} color="#46C253" role="button" className="me-3" />
											</CustomTooltip>
											<CustomTooltip text="Unfriend" position="top">
												<PersonDashFill size={35} role="button" onClick={() => deleteFriendship(friendship.user)} color="red" />
											</CustomTooltip>
										</div>
									</div>
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
								<div key={friendship.user.id} className="container">
									<div className="row p-2 align-items-center border-bottom">
										<div className="col-1">
											{
												friendship.user.is_online ? (
													<>
														<CustomTooltip text="Online" position="bottom">
															<CircleFill color="green" size={8} />
														</CustomTooltip>
													</>
												) : (
													<>
														<CustomTooltip text="Offline" position="bottom">
															<CircleFill color="red" size={8} />
														</CustomTooltip>
													</>
												)
											}
										</div>
										<div className="col-auto">
											<div className="position-relative border border-1 border-dark-subtle rounded-circle" style={{ width: '30px', height: '30px', overflow: 'hidden' }}>
												<Image
													style={{objectFit: 'cover'}}
													alt="profile picture"
													src={`http://backend:8000${friendship.user.image}`}
													fill
													sizes={"20vw"}
												/>
											</div>
										</div>
										<div className="col overflow-hidden">
											<span className="d-block fs-4 fw-semibold text-truncate">
												{friendship.user.username}
											</span>
										</div>
										<div className="col-auto">
											{
												(friendship.user.id === friendship.requestor) ? (
													<>
														<CustomTooltip text="Approuve Request" position="top">
															<CheckCircleFill size={35} role="button" onClick={() => approveFriendRequest(friendship.user)} className="me-2" color="green" />
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
								</div>
						)))
				}
			</div>
		</>
	)
}