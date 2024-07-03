'use client';

import { useState, useContext, useEffect, useRef } from 'react';
import { Button, Container, Row, Col, Offcanvas } from 'react-bootstrap';
import FriendList from "@/components/ui/friend_list/FriendList";
import { GameContext } from '@/app/context/GameContext';
import Tournament from '@/components/Tournament';
import { useRouter } from 'next/navigation';
import VideoButton from '@/components/buttons/VideoButtons';

enum GameType {
  PONG = 'pong',
  PING = 'ping',
  ICRICKET = 'iCricket',
  TT = 'TT ',
  TUBE_RUSH = 'tubeRush',
}

export default function Home() {
  const videoRef = useRef(null)
  const [show, setShow] = useState(false);
  const [game, setGameOnPage] = useState(null);

  const { setGame } = useContext(GameContext);
  const router = useRouter()



  useEffect(() => {
    localStorage.setItem('gameName', JSON.stringify(null))
    setGame(game);
  }, [game])
  
  const handleGame = (gameName) => {
    setGame(gameName);
    // localStorage.setItem('gameName', JSON.stringify(gameName))
    router.push(`/tournaments/${gameName}`)
  }

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    !game ? (
      <Container className="d-flex justify-content-center align-items-center mt-5 pt-5">
        <Row className="justify-content-center align-items-center w-100">
          <Col className="col-6 d-flex justify-content-center align-items-center">
            <VideoButton src="/pong.mov" gameName="pong"/>
          </Col>
          <Col className="col-6 d-flex justify-content-center align-items-center">
            <VideoButton src="/pong.mov" gameName="pong"/>
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
