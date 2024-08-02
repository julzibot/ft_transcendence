"use client";

import 'bootstrap-icons/font/bootstrap-icons.css'
import { Trash3Fill, Joystick, ChatDotsFill, CircleFill } from 'react-bootstrap-icons';
import { CustomTooltip } from '@/components/Utils/Tooltip';
import SearchPlayerInput from './SearchPlayerInput';
import { useEffect, useState } from 'react'
import {useSession} from 'next-auth/react'
import Image from "next/image";

export default function FriendList() {
	const {data: session} = useSession()
	const [friends, setFriends] = useState([])


	useEffect(() => {
		fetchFriends()
	}, [])

	async function fetchFriends(){
		const response = await fetch(`http://localhost:8000/api/friends/get/?id=${session.user.id}` , {
			method: 'GET'
		})
		const data = await response.json()
		setFriends(data)
	}

	async function approveFriendRequest(friend) {
		const response = await fetch(`http://localhost:8000/api/friends/approve-friend-request/`, {
			method: 'PUT',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				'approving_user_id': session.user.id,
				'pending_user_id': friend.id,
				'requestor_id': friend.id
			})
		})
		if(response.status === 202) {
			fetchFriends()
		}
	}

	async function deleteFriendship(friend) {
		const response = await fetch('http://localhost:8000/api/friends/delete-friendship/', {
			method: 'DELETE',
			headers: {'Content-type': 'application/json'},
			body: JSON.stringify({
				'user_id1': session.user.id,
				'user_id2': friend.id
			})
		})
		if(response.status === 204)
			fetchFriends()
	}

	return (
		<>
				<SearchPlayerInput fetchFriends={fetchFriends}/>

				<button 
					className="btn btn-secondary btn-sm dropdown-toggle w-100 mt-3" 
					type="button" 
					data-bs-toggle="collapse" 
					data-bs-target="#friendsCollapse" 
					aria-expanded="false" 
					aria-controls="friendsCollapse">
					Friends ({friends.filter(friend => friend.status === 'FRIENDS').length})
				</button>

				<ul className="collapse border" id="friendsCollapse">
						{
							friends.map((friend) => (
								friend.status === 'FRIENDS' && (
									<>
										<li key={friend.user.id} className="list-group-item">
												{
													friend.user.is_online ? (
														<>
															<CustomTooltip text="Online" position="bottom">
																	<CircleFill color="green" />
															</CustomTooltip>
														</>
													) : (
														<>
															<CustomTooltip text="Offline" position="bottom">
																<CircleFill color="red" />
															</CustomTooltip>													
														</>
													)
												}
												<Image
													src={`http://backend:8000${friend.user.image}`}
													className="rounded-circle border ms-2 me-2"
													alt="friend image"
													height={20}
													width={20}
												/>
												<span>{friend.user.username}</span>
												<CustomTooltip text="remove friend" position="top">
													<button className='btn' onClick={() => deleteFriendship(friend.user)}>
														<Trash3Fill color="red" />
													</button>
												</CustomTooltip>
										</li>
								</>
							)))
						}
				</ul>

				<button 
					class="btn btn-secondary btn-sm dropdown-toggle w-100 mt-3" 
					type="button" 
					data-bs-toggle="collapse" 
					data-bs-target="#friendRequestsCollapse" 
					aria-expanded="false" 
					aria-controls="friendRequestsCollapse">
					Friend Requests ({friends.filter(friend => friend.status === 'REQUEST').length})
				</button>

				<ul className="collapse border" id="friendRequestsCollapse">
						{
							friends.map((friend) => (
								friend.status === 'REQUEST' && (
									<>
										<li key={friend.user.id} className="list-group-item">
											{
													friend.user.is_online ? (
														<>
															<CustomTooltip text="Online" position="bottom">
																	<CircleFill color="green" />
															</CustomTooltip>
														</>
													) : (
														<>
															<CustomTooltip text="Offline" position="bottom">
																<CircleFill color="red" />
															</CustomTooltip>													
														</>
													)
												}
												<Image
													src={`http://backend:8000${friend.user.image}`} 
													className="rounded-circle border ms-2 me-2"
													alt="user image"
													height={30}
													width={30}
												/>
												<span>{friend.user.username}</span>
												{
													(friend.user.id === friend.requestor) ? (
														<>
															<CustomTooltip text="Approuve Request" position="top">
																<button className='btn text-success' onClick={() => approveFriendRequest(friend.user)}>
																	<i class="bi bi-check-circle-fill"></i>
																</button>
															</CustomTooltip>
															<CustomTooltip text="Deny Request" position="top">
																<button className='btn text-danger' onClick={() => deleteFriendship(friend.user)}>
																	<i class="bi bi-x-circle-fill"></i>
																</button>
															</CustomTooltip>
														</>
													) : (
														<CustomTooltip text="Cancel Request" position="top">
															<button className='btn text-danger' onClick={() => deleteFriendship(friend.user)}>
																<i class="bi bi-x-circle-fill"></i>
															</button>
														</CustomTooltip>
													)
												}
										</li>
								</>
							)))
						}
					</ul>
		</>
  )
}