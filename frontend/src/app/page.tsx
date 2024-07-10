'use client';

import { useState } from 'react';
import { Button, Offcanvas } from 'react-bootstrap';
import FriendList from "@/components/ui/friend_list/FriendList";
import GameCard from '@/components/cards/GameCard';


export default function Home() {
  const [show, setShow] = useState(false);


  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <div className="d-flex flex-row justify-content-center mt-5 pt-5">
        <GameCard src="/pong.mov" />
      </div>
      {/* <Offcanvas
        show={show}
        onHide={handleClose}
        placement="end"
        scroll={true}
      > */}
        {/* <Offcanvas.Header closeButton>
          <Offcanvas.Title>Friends List</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <FriendList />
        </Offcanvas.Body>
      {/* </Offcanvas>
      <Button
        variant="primary"
        className="position-fixed bottom-0 end-0 m-4"
        onClick={handleShow}
        >
        Friends List
      </Button> */} */}
    </>
  )
}
