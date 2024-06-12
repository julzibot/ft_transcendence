"use client";

import 'bootstrap-icons/font/bootstrap-icons.css'
import { Trash3Fill, Joystick, Dot, ChatDotsFill } from 'react-bootstrap-icons';
import { CustomTooltip } from '@/components/Utils/Tooltip';
import SearchPlayerInput from './SearchPlayerInput';

export default function FriendList() {
	const friends = [{
		name: 'John Doe',
		isOnline: true,
		}, {
		name: 'Jane Doe',
		isOnline: false,
		}, {
		name: 'Foo Bar',
		isOnline: true,
		}, {
		name: 'Baz Qux',
		isOnline: false,
		}];

	return (
    <div>
			<button 
				class="btn btn-secondary btn-sm dropdown-toggle" 
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
							<div key={index} className="d-flex flex-row justify-content-between">
								<div className="">
									<img src={friend.avatar} />
								</div>
								<div className="">
									<h3>{friend.name}</h3>
									<p>{friend.status}</p>
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
						))}
				</div>
			</div>
			<button 
				class="btn btn-secondary btn-sm dropdown-toggle" 
				type="button" 
				data-bs-toggle="collapse" 
				data-bs-target="#requestedFriendsCollapse" 
				aria-expanded="false" 
				aria-controls="collapseExample">
				Friend Requests
			</button>
			<div className="collapse" id="requestedFriendsCollapse">
				<div className="card card-body">
					{
							friends.map((friend, index) => (
								<div key={index} className="d-flex flex-row justify-content-between">
									<div className="">
										<img src={friend.avatar} />
									</div>
									<div className="">
										<h3>{friend.name}</h3>
										<p>{friend.status}</p>
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
							))}
				</div>
			</div>
			<SearchPlayerInput />
    </div>
  )
}