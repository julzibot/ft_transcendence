"use client";
import 'bootstrap-icons/font/bootstrap-icons.css'
import { Trash3Fill, Joystick, Dot } from 'react-bootstrap-icons';
import { CustomTooltip } from '@/components/Utils/Tooltip';
import "./style.css"
import SearchPlayerInput from './SearchPlayerInput';

export default function FriendList() {
  let friendsCount = 1
  return (
    <>
      <div className="d-flex position-fixed ps-2 pe-2 end-0 flex-column bg-dark text-light">
        <h1>Friend List</h1>
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
                  <ul>
                    <li>
                      Antoine
                      <CustomTooltip text='Send Game Request' position={'bottom'}>
                        <button className='btn' type="button">
                          <Joystick color="green" size={17} />
                        </button>
                      </CustomTooltip>
                      <CustomTooltip text="Delete Friend" position={'bottom'}>
                        <button className='btn'>
                          <Trash3Fill color='red' size={17}/>
                        </button>
                      </CustomTooltip>
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
    </>
  )
}