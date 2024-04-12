"use client";
import 'bootstrap-icons/font/bootstrap-icons.css'
import { Trash3Fill, Joystick, Dot, AlignCenter, SuitDiamondFill, Mailbox, EnvelopeFill, ChatDotsFill } from 'react-bootstrap-icons';
import { CustomTooltip } from '@/components/Utils/Tooltip';
import "./style.css"
import SearchPlayerInput from './SearchPlayerInput';

export default function FriendList() {
  let friendsCount = 1
  return (
    <>
		{/* <button className="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offCanvasFriendList" aria-controls="offCanvasFriendList">Play with Friends</button> */}
		<div className="offcanvas offcanvas-end" data-bs-scroll="true" data-bs-backdrop="false" id="offCanvasFriendList" aria-labelledby="offcanvasFriendListLabel">
			<div className="offcanvas-header p-4 pb-1">
				<h5 className="offcanvas-title" id="offcanvasFriendListLabel">Friend List</h5>
				<button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
			</div>
			<div className="offcanvas-body">
				<div className="flex-column">
						<div className="accordion" id="friendsAccordion">
							<div className="accordion-item">
								<h2 className="accordion-header">
									<button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#onlineFriends" aria-expanded="true" aria-controls="onlineFriends">
										<Dot color='green' size={45}/>
										Online Friends
										({friendsCount})
									</button>
								</h2>
								<div id="onlineFriends" className="accordion-collapse collapse show">
									<div className="accordion-body">
										<ul className='list-group'>
											<li className='list-group-item d-flex justify-content-between align-items-center'>
												<div>
													<CustomTooltip text='Send Game Request' position={'auto-start'}>
														<button className='btn' type="button">
															<Joystick color="green" size={17} />
														</button>
													</CustomTooltip>
													<CustomTooltip text="Delete Friend" position={'auto-start'}>
														<button className='btn'>
															<Trash3Fill color='red' size={17} />
														</button>
													</CustomTooltip>
												</div>
													Antoine
												<ChatDotsFill color='blue' size={15} />
											</li>
											<li className='list-group-item d-flex justify-content-between align-items-center'>
												<div>
													<CustomTooltip text='Send Game Request' position={'auto-start'}>
														<button className='btn' type="button">
															<Joystick color="green" size={17} />
														</button>
													</CustomTooltip>
													<CustomTooltip text="Delete Friend" position={'auto-start'}>
														<button className='btn'>
															<Trash3Fill color='red' size={17} />
														</button>
													</CustomTooltip>
												</div>
													Milan
												<ChatDotsFill color='blue' size={15} />
											</li>
										</ul>
									</div>
								</div>
							</div>
							<div className="accordion-item">
								<h2 className="accordion-header">
									<button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#offlineFriends" aria-expanded="false" aria-controls="offlineFriends">
									<Dot color='red' size={45}/>
										Offline Friends
										({friendsCount})
									</button>
								</h2>
								<div id="offlineFriends" className="accordion-collapse collapse">
									<div className="accordion-body">
										<ul>
											<li>
												Tosh
												<button>PLAY</button>
												<button>RM</button>
											</li>
										</ul>
									</div>
								</div>
							</div>
						</div>     
					</div>
        <SearchPlayerInput />
			</div>
		</div>
    </>
  )
}