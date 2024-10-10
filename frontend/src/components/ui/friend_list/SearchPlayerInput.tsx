"use client";

import React, { useState, useEffect } from "react"
import { PersonFillAdd, CircleFill, PersonDashFill, XCircleFill, CheckCircleFill } from "react-bootstrap-icons";
import { CustomTooltip } from "@/components/Utils/Tooltip";
import useDebounce from "@/components/Utils/CustomHooks/useDebounce";
import { Toast, ToastContainer } from 'react-bootstrap'
import Image from "next/image";
import Link from "next/link";
import DOMPurify from "dompurify";
import Cookies from "js-cookie";
import { useAuth } from "@/app/lib/AuthContext";

import { Friend } from "@/types/Friend";
import { User } from "@/types/User";
import { SearchPlayerInputProps } from "@/types/Props";
import { BACKEND_URL } from "@/config";


export default function SearchPlayerInput({ fetchFriends }: SearchPlayerInputProps) {
  const [searchQuery, setSearchQuery] = useState<User[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [click, setClick] = useState<boolean>(false)
  const { session } = useAuth()
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
    const response = await fetch(`${BACKEND_URL}/api/search-user/?query=${inputValue}&id=${session?.user?.id}`, {
      method: "GET",
      credentials: 'include',
    })
    if (response.status != 200) {
      setSearchQuery([])
      return false
    }
    const data = await response.json()
    setSearchQuery(data.users)
  }

  async function deleteFriendship(friend: Friend) {
    const response = await fetch(`${BACKEND_URL}/api/friends/delete-friendship/`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-type': 'application/json',
        'X-CSRFToken': Cookies.get('csrftoken') as string
       },
      body: JSON.stringify({
        'user_id1': session?.user?.id,
        'user_id2': friend.id
      })
    })
    if (response.status === 204)
      fetchFriends()
    setClick(!click)
  }


  const handleFriendRequest = async (fromUserId: number | undefined, toUserId: number | undefined) => {
    fetch(BACKEND_URL + "/friends/send-friend-request/", {
      method: "POST",
      credentials: 'include',
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRFToken': Cookies.get('csrftoken') as string
      },
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
    const response = await fetch(`${BACKEND_URL}/api/friends/approve-friend-request/`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRFToken': Cookies.get('csrftoken') as string
      },
      credentials: 'include',
      body: JSON.stringify({
        'approving_user_id': session?.user?.id,
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
            {user.requestor_id !== session?.user?.id ? (
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
            <PersonFillAdd size={35} role="button" onClick={() => handleFriendRequest(session?.user?.id, user.id)} color="green" />
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
                  <img
                    style={{
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                    fetchPriority="high"
                    alt="profile picture"
                    src={`${BACKEND_URL}${user.image}`}
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