"use client";

import 'bootstrap-icons/font/bootstrap-icons.css'
import { Trash3Fill, Joystick, Dot, ChatDotsFill } from 'react-bootstrap-icons';
import { CustomTooltip } from '@/components/Utils/Tooltip';
import SearchPlayerInput from './SearchPlayerInput';
import { useEffect, useState } from 'react'
import {useSession} from 'next-auth/react'

export default function FriendList() {
	const {data: session} = useSession()
	const [friends, setFriends] = useState([])


	useEffect(() => {
		fecthFriends()
	}, [])

	async function fecthFriends(){
		const response = await fetch(`http://localhost:8000/api/friends/get/?id=${session.user.id}` , {
			method: 'GET'
		})
		const data = await response.json()
		setFriends(data)
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
					Friends
				</button>
				<div className="collapse" id="friendsCollapse">
					<div className="card card-body">
						{
							friends.map((friend, index) => (
								friend.status === 'FRIENDS' && (
									<>
										<div key={index} className="d-flex flex-row justify-content-between">
											<div className="">
												<img 
												src={`http://localhost:8000${friend.user.image}`}
												className="rounded-circle border ms-2 me-2"
												alt="user image"
												height={50}
												width={50}
												/>
											</div>
											<div className="">
												<h3>{friend.user.nick_name}</h3>
											</div>
											<div className="">
												<CustomTooltip text="Invite to play" position="top">
													<button className='btn'>
														<Joystick color="green" />
													</button>
												</CustomTooltip>
												<CustomTooltip text="remove friend" position="top">
													<button className='btn'>
														<Trash3Fill color="red" />
													</button>
												</CustomTooltip>
												<CustomTooltip text="Send message" position="top">
													<button className='btn'>
														<ChatDotsFill color="blue" />
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
					class="btn btn-secondary btn-sm dropdown-toggle" 
					type="button" 
					data-bs-toggle="collapse" 
					data-bs-target="#friendRequestsCollapse" 
					aria-expanded="false" 
					aria-controls="friendRequestsCollapse">
					Friend Requests
				</button>
				<div className="collapse" id="friendRequestsCollapse">
					<div className="card card-body">
						{
							friends.map((friend, index) => (
								friend.status === 'REQUEST' && (
									<>
										<div key={index} className="d-flex flex-row justify-content-between">
											<div className="">
												<img 
												src={`http://localhost:8000${friend.user.image}`} 
												className="rounded-circle border ms-2 me-2"
												alt="user image"
												height={50}
												width={50}/>
											</div>
											<div className="">
												<h3>{friend.user.nick_name}</h3>
											</div>
											<div className="">
												<CustomTooltip text="Invite to play" position="top">
													<button className='btn'>
														<Joystick color="green" />
													</button>
												</CustomTooltip>
												<CustomTooltip text="remove friend" position="top">
													<button className='btn'>
														<Trash3Fill color="red" />
													</button>
												</CustomTooltip>
												<CustomTooltip text="Send message" position="top">
													<button className='btn'>
														<ChatDotsFill color="blue" />
													</button>
												</CustomTooltip>
											</div>
										</div>
								</>
							)))
						}
					</div>
				</div>
				<SearchPlayerInput />
			</div>
		</>
  )
}