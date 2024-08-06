"use client";

import {useState} from 'react'
import {Offcanvas} from 'react-bootstrap'
import FriendList from '../friend_list/FriendList';

export default function Sidenav() {
  const [show, setShow] = useState<Boolean>(false)

  return (
    <>
      <div className="position-fixed top-50 end-0">
        <ul className="nav flex-column position-absolute top-100 end-0">
          <li className="nav-item">
            <button className="btn btn-light btn-lg" onClick={() => setShow(true)}>
            <i className="bi bi-caret-left-fill"></i>
            <i className="ms-1 bi bi-people-fill"></i>
            </button>
          </li>
        </ul>
      </div>
      <Offcanvas
					show={show}
					onHide={() => setShow(false)}
					placement="end"
					scroll={false}
					> 
					<Offcanvas.Header closeButton>
						<Offcanvas.Title>Friend List</Offcanvas.Title>
					</Offcanvas.Header>
					<Offcanvas.Body>
						<FriendList />
					</Offcanvas.Body>
				</Offcanvas>
    </>
  )
}