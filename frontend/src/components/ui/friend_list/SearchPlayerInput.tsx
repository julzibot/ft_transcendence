"use client";

import React, { useState, useEffect } from "react"
import { PersonAdd  } from "react-bootstrap-icons";
import { CustomTooltip } from "@/components/Utils/Tooltip";
import { useSession } from "next-auth/react";
import useDebounce from "@/components/Utils/CustomHooks/useDebounce";
import { Toast, ToastContainer } from 'react-bootstrap'
import Image from "next/image";

export default function SearchPlayerInput({fetchFriends}) {
  const [searchQuery, setSearchQuery] = useState([]);
  const [inputValue, setInputValue] = useState<string>('');
  const {data: session} = useSession()
  const [toastParams, setToastParams] = useState({
    text: '',
    color: '',
    title: '',
    show: false
  })

  const debounce = useDebounce(inputValue, 800)

  useEffect(() => {
    fetchData()
  }, [debounce])


  const fetchData = async () => {
    const response = await fetch(`http://localhost:8000/api/search-user/?query=${inputValue}&id=${session.user.id}`, {
      method: "GET",
    })
    if(!response.ok) {
      setSearchQuery([])
      return false
    }
    const data = await response.json()
    setSearchQuery(data.users)
  }

  const handleFriendRequest = async(fromUserId: number, toUserId: number) => {
    fetch("http://localhost:8000/api/friends/send-friend-request/", {
      method: "POST",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        "from_user": fromUserId,
        "to_user": toUserId
      })
    }).then(response => {
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

  return(
    <>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)} 
        type="search" 
        placeholder="Search Player" 
      />
        {
          searchQuery.length > 0 && (
            <div className="pt-5 text-dark align-items-center">
              {
                searchQuery.map((user, index) => (
                  <div key={index} className="border border-2 text-dark">
                    <Image 
                      src={`http://backend:8000/media/${user.image}`}
                      className="rounded-circle border ms-2 me-2"
                      alt="user image"
                      height={20}
                      width={20}
                    />
                    <span>{user.nick_name}</span>
                    <CustomTooltip text="Send Friend Request" position="bottom">
                      <button className="btn" onClick={() => handleFriendRequest(session?.user.id, user.id)}>
                        <PersonAdd color="green" width={15} />
                      </button>
                    </CustomTooltip>
                  </div>
                ))
              }
            </div>)
        }
        <ToastContainer
          className="p-3"
          position='bottom-center'
          style={{ zIndex: 1 }}
        >
          <Toast 
            onClose={() => setToastParams((params) => ({...params, show: false}))} 
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