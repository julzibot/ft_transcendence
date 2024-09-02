"use client";

import React, { useState, useEffect } from "react"
import { PersonFillAdd, CircleFill, PersonDashFill, XCircleFill, Joystick, CheckCircleFill } from "react-bootstrap-icons";
import { CustomTooltip } from "@/components/Utils/Tooltip";
import { useSession } from "next-auth/react";
import useDebounce from "@/components/Utils/CustomHooks/useDebounce";
import { Toast, ToastContainer } from 'react-bootstrap'
import Image from "next/image";
import Link from "next/link";
import DOMPurify from "dompurify";

import { Friend } from "@/types/Friend";
import { User } from "@/types/User";
import { SearchPlayerInputProps } from "@/types/Props";

const BASE_URL = "http://localhost:8000/api/"


export default function SearchPlayerInput({ fetchFriends }: SearchPlayerInputProps) {
  const [searchQuery, setSearchQuery] = useState<User[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [click, setClick] = useState<boolean>(false)
  const { data: session } = useSession()
  const [toastParams, setToastParams] = useState({
    text: '',
    color: '',
    title: '',
    show: false
  })

  const debounce = useDebounce(inputValue, 500)

  useEffect(() => {
    fetchData()
  }, [debounce, click])

  const fetchData = async () => {
    const response = await fetch(`http://localhost:8000/api/search-user/?query=${inputValue}&id=${session?.user.id}`, {
      method: "GET",
    })
    if (response.status != 200) {
      setSearchQuery([])
      return false
    }
    const data = await response.json()
    setSearchQuery(data.users)
  }

  async function deleteFriendship(friend: Friend) {
    const response = await fetch('http://localhost:8000/api/friends/delete-friendship/', {
      method: 'DELETE',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({
        'user_id1': session?.user.id,
        'user_id2': friend.id
      })
    })
    if (response.status === 204)
      fetchFriends()
    setClick(!click)
  }


  const handleFriendRequest = async (fromUserId: number | undefined, toUserId: number | undefined) => {
    if (!fromUserId || !toUserId) {
      console.error('Session is undifined')
      return
    }

    fetch(BASE_URL + "friends/send-friend-request/", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "from_user": fromUserId,
        "to_user": toUserId
      })
    }).then(response => {
      setClick(!click)
      if (response.status === 201) {
        setToastParams({
          text: 'Request successfully sent',
          color: 'success',
          title: 'Success',
          show: true,
        })
        fetchFriends()
      }
      else {
        setToastParams({
          text: 'A request is pending with this user, check your friend requests',
          color: 'warning',
          title: 'Warning',
          show: true
        })
      }
    }).catch(error => {
      console.error('Error sending friend request:', error);
    });
  }

  async function approveFriendRequest(user: User) {
    const response = await fetch(`http://localhost:8000/api/friends/approve-friend-request/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'approving_user_id': session?.user.id,
        'pending_user_id': user.id,
        'requestor_id': user.id
      })
    })
    if (response.status === 202) {
      fetchData()
    }
  }

  function renderStatus(user: User) {
    switch (user.friendship_status) {
      case 'FRIENDS':
        return (
          <>
            <CustomTooltip text="Unfriend" position="top">
              <PersonDashFill size={35} role="button" onClick={() => deleteFriendship(user)} color="red" />
            </CustomTooltip>
          </>
        )
      case 'REQUEST':
        return (
          <>
            {user.requestor_id !== session?.user.id ? (
              <>
                <CustomTooltip text="Accept Request" position="top">
                  <CheckCircleFill size={35} role="button" className="me-1" onClick={() => approveFriendRequest(user)} color="green" />
                </CustomTooltip>
                <CustomTooltip text="Deny Request" position="top">
                  <XCircleFill size={35} role="button" onClick={() => deleteFriendship(user)} color="red" />
                </CustomTooltip>
              </>
            ) : (
              <CustomTooltip text="Cancel Request" position="top">
                <XCircleFill size={35} role="button" onClick={() => deleteFriendship(user)} color="red" />
              </CustomTooltip>
            )}
          </>
        );
      default:
        return (
          <CustomTooltip text="Send Friend Request" position="bottom">
            <PersonFillAdd size={35} role="button" onClick={() => handleFriendRequest(session?.user.id, user.id)} color="green" />
          </CustomTooltip>
        )
    }
  }

  return (
    <>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(DOMPurify.sanitize(e.target.value))}
        type="search"
        className="form-control"
        placeholder="Search Player"
      />

      <div className="border border-bottom-0">
        {
          searchQuery.length > 0 && searchQuery.map((user) => (
            <div key={user.id} className="d-flex flex-row align-items-center border-bottom">
                <div className="ms-2 me-2">
                  {
                    user.is_online ? (
                      <CircleFill color="green" size={12} />
                    ) : (
                      <CircleFill color="red" size={12} />
                    )
                  }
                </div>
                  <Link href={`/account/${user.id}`}>
                  <div className="me-3 position-relative border border-1 border-dark-subtle rounded-circle" style={{ width: '30px', height: '30px', overflow: 'hidden' }}>
                    <Image
                      style={{ objectFit: 'cover' }}
                      alt="profile picture"
                      src={`http://backend:8000${user.image}`}
                      fill
                      sizes="20vw"
                      />
                  </div>
                      </Link>
                  <span className="flex-grow-1 overflow-hidden fs-4 fw-semibold text-truncate">
                    {user.username}
                  </span>
                <div className="me-2">
                  {renderStatus(user)}
                </div>
            </div>
          ))
        }
      </div >

      <ToastContainer
        className="p-3"
        position='bottom-center'
        style={{ zIndex: 1 }}
      >
        <Toast
          onClose={() => setToastParams((params) => ({ ...params, show: false }))}
          show={toastParams.show}
          delay={5000}
          autohide
          bg={toastParams.color}
        >
          <Toast.Header className={(toastParams.title === 'Success') ? "text-success" : "text-secondary"}>
            {
              (toastParams.title === 'Success') ? (
                <i className="bi bi-check-circle-fill"></i>
              ) : (
                <i className="bi bi-exclamation-triangle-fill"></i>
              )
            }
            <strong className="ms-1 me-auto">{toastParams.title}</strong>
          </Toast.Header>
          <Toast.Body className="text-light">{toastParams.text}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}