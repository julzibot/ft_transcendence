"use client";

import { useAuth } from "@/app/lib/AuthContext";
import Dropdown from 'react-bootstrap/Dropdown';
import Image from "@/components/Utils/Image";
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Modal from 'react-bootstrap/Modal';
import { useState } from "react";

export default function AuthButton() {
  const { session, logout, loading } = useAuth();
  const [show, setShow] = useState(false);

  return (
    <>
      <Dropdown as={ButtonGroup} size="lg">
        <div className="d-flex align-items-center bg-light rounded-start-3 ps-2">
          <Image src={session?.user?.image} alt="profile picture" whRatio="30px" loading={loading} />
          <span className="ms-2 pe-2 fw-bold">{session?.user?.username}</span>
        </div>
        <Dropdown.Toggle split variant="light" id="dropdown-basic">
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item href={`/account/${session?.user?.id}`}>Account</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item as="button" onClick={() => setShow(true)}>Sign Out</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>


      <Modal
        show={show}
        backdrop="static"
        keyboard={false}
        onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Signing out</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to sign out?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShow(false)}>
            Close
          </Button>
          <Button onClick={() => logout()} variant="outline-danger">Sign Out</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}