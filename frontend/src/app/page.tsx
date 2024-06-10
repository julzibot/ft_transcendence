'use client';

import { useState, useContext, useEffect } from 'react';
import { Button, Container, Row, Col, Offcanvas } from 'react-bootstrap';
import FriendList from "@/components/ui/friend_list/FriendList";
import { GameContext } from '@/app/context/GameContext';
import Tournament from '@/components/Tournament';

enum GameType {
  PONG = 'pong',
  TUBE_RUSH = 'tubeRush',
}

export default function Home() {
  const [show, setShow] = useState(false);
  const [game, setGameOnPage] = useState(null);

  const { setGame } = useContext(GameContext);

  useEffect(() => {
    setGame(game);
  }, [game])

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    !game ? (
      <Container fluid className="h-100 vw-100">
        <Row className="h-100">
          <Col className="h-100">
            <button onClick={() =>setGameOnPage(GameType.PONG)}>
              {GameType.PONG}
            </button>
          </Col>
          <Col className="h-100">
          {/** TODO: FIX THIS before pushing */}
            {/* <button onClick={() => setGameOnPage(GameType.TUBE_RUSH)}> */}
              <video width="320" height="240" autoPlay loop muted src="/pong.mov">
                {/* <source src="/pong.mov" type="video/mp4" /> */}
              </video>
              {/* {GameType.TUBE_RUSH} */}
            {/* </button> */}
          </Col>
        </Row>
      </Container>
    ): (
      <Container fluid>
      <Row className="justify-content-between">
        <Col>
        </Col>
        <Col>
          <Tournament /> 
        </Col>
      </Row>
      <Offcanvas
        show={show}
        onHide={handleClose}
        placement="end"
        scroll={true}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Friends List</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <FriendList />
        </Offcanvas.Body>
      </Offcanvas>
      <Button
        variant="primary"
        className="position-fixed bottom-0 end-0 m-4"
        onClick={handleShow}
        >
        Friends List
      </Button>
    </Container>
    )
  )
}
