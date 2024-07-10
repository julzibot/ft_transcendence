'use client';

import { useState, useContext, useEffect, useRef } from 'react';
import { Button, Container, Row, Col, Offcanvas } from 'react-bootstrap';
import FriendList from "@/components/ui/friend_list/FriendList";
import { GameContext } from '@/app/context/GameContext';
import Tournament from '@/components/Tournament';
import { useRouter } from 'next/navigation';
import GameCard from '@/components/cards/GameCard';
import Lobby from '@/components/Lobby';

enum GameType {
  PONG = 'Pong',
  TUBE_RUSH = 'tubeRush',
}

export default function Home() {
  const [show, setShow] = useState(false);
  const [game, setGameOnPage] = useState(null);
  const [move, setMove] = useState(false);

  const { game, setGame } = useContext(GameContext);
  const router = useRouter()


  const handleCardClick = (gameName) => {
    setGame(gameName);
    setMove(!move);
  };



  useEffect(() => {
    // localStorage.setItem('gameName', JSON.stringify(null))
    setGame(game);
  }, [game])
  
  // const handleGame = (gameName) => {
  //   // localStorage.setItem('gameName', JSON.stringify(gameName))
  //   // router.push(`/tournaments/${gameName}`)
  // }

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    !game ? (
      <div className="d-flex flex-row justify-content-evenly mt-5 pt-5">
        <GameCard src="/pong.mov" gameName="Pong" position="left" move={move} onClick={()=> handleCardClick(GameType.PONG)}/>
        <GameCard src="/pong.mov" gameName="Coming Soon" position="right" move={move} onClick={() => handleCardClick(GameType.TUBE_RUSH)}/>
      </div>
    ): (
      <Container fluid>
      <Row className="justify-content-between">
        <Col>
          <Lobby gameName={game} />
        </Col>
        <Col>
          <Tournament gameName={game}/> 
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
