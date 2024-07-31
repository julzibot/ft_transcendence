"use client";

import 'bootstrap-icons/font/bootstrap-icons.css'
import { Trash3Fill, Joystick, ChatDotsFill, CircleFill } from 'react-bootstrap-icons';
import { CustomTooltip } from '@/components/Utils/Tooltip';
import SearchPlayerInput from './SearchPlayerInput';
import { useEffect, useState } from 'react'
import {useSession} from 'next-auth/react'

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
			<div>
				<button 
					className="btn btn-secondary btn-sm dropdown-toggle" 
					type="button" 
					data-bs-toggle="collapse" 
					data-bs-target="#friendsCollapse" 
					aria-expanded="false" 
					aria-controls="friendsCollapse">
					Friends ({friends.filter(friend => friend.status === 'FRIENDS').length})
				</button>
				<div className="collapse" id="friendsCollapse">
					<div className="card card-body">
						{
							friends.map((friend) => (
								friend.status === 'FRIENDS' && (
									<>
										<div key={friend.user.id} className="d-flex flex-row justify-content-between">
											<div className="">
												{
													friend.user.is_active ? (
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
												<img 
												src={`http://localhost:8000${friend.user.image}`}
												className="rounded-circle border ms-2 me-2"
												alt="user image"
												height={50}
												width={50}
												/>
											</div>
											<div className="">
												<h3>{friend.user.username}</h3>
											</div>
											<div className="">
												{/* <CustomTooltip text="Invite to play" position="top">
													<button className='btn'>
														<Joystick color="green" />
													</button>
												</CustomTooltip> */}
												<CustomTooltip text="remove friend" position="top">
													<button className='btn' onClick={() => deleteFriendship(friend.user)}>
														<Trash3Fill color="red" />
													</button>
												</CustomTooltip>
											</div>
										</div>
								</>
							)))
						}
					</div>
				</div>
				<button 
					className="btn btn-secondary btn-sm dropdown-toggle" 
					type="button" 
					data-bs-toggle="collapse" 
					data-bs-target="#friendRequestsCollapse" 
					aria-expanded="false" 
					aria-controls="friendRequestsCollapse">
					Friend Requests ({friends.filter(friend => friend.status === 'REQUEST').length})
				</button>
				<div className="collapse" id="friendRequestsCollapse">
					<div className="card card-body">
						{
							friends.map((friend) => (
								friend.status === 'REQUEST' && (
									<>
										<div key={friend.user.id} className="d-flex flex-row justify-content-between">
											<div className="">
											{
													friend.user.is_active ? (
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
												<img 
												src={`http://localhost:8000${friend.user.image}`} 
												className="rounded-circle border ms-2 me-2"
												alt="user image"
												height={50}
												width={50}/>
											</div>
											<div className="">
												<h3>{friend.user.username}</h3>
											</div>
											<div className="">
												{
													(friend.user.id === friend.requestor) ? (
														<>
															<CustomTooltip text="Approuve Request" position="top">
																<button className='btn text-success' onClick={() => approveFriendRequest(friend.user)}>
																<i className="bi bi-check-circle-fill"></i>
																</button>
															</CustomTooltip>
															<CustomTooltip text="Deny Request" position="top">
																<button className='btn text-danger' onClick={() => deleteFriendship(friend.user)}>
																<i className="bi bi-x-circle-fill"></i>
																</button>
															</CustomTooltip>
														</>
													) : (
														<CustomTooltip text="Cancel Request" position="top">
															<button className='btn text-danger' onClick={() => deleteFriendship(friend.user)}>
																<i className="bi bi-x-circle-fill"></i>
															</button>
														</CustomTooltip>
													)
												}
											</div>
										</div>
								</>
							)))
						}
					</div>
				</div>
				<SearchPlayerInput fetchFriends={fetchFriends}/>
			</div>
		</>
  )
}