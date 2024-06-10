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
    <div className="border-left border-dark pl-3">
	<SearchPlayerInput />
	<div className="d-flex flex-column pt-4">
		{friends.map((friend, index) => (
			<div key={index} className="d-flex flex-row justify-content-between">
				{/**TODO: RENDER IMAGES OF USERS */}
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
  )
}