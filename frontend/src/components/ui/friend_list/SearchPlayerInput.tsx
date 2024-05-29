"use client";

import React, { useState } from "react"
import { PersonAdd  } from "react-bootstrap-icons";
import { CustomTooltip } from "@/components/Utils/Tooltip";
import { useSession } from "next-auth/react";

export default function SearchPlayerInput() {
  const [searchQuery, setSearchQuery] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const {data: session} = useSession()

  const handleSearch = async (event: any) => {
    setInputValue(event.target.value)
    const response = await fetch("http://localhost:8000/api/search-user/", {
      method: "post",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        id: session?.user.id,
        query: event.target.value})
    })
    if(!response.ok) {
      setSearchQuery([])
      return false
    }
    const res = await response.json()
    setSearchQuery(res.users)
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
      if (response.status === 201)
        console.log('Friend request sent');
      else
        console.log('Friend request already sent');
    }).catch(error => {
      console.error('Error sending friend request:', error);
    });
  }

  return(
    <form className="d-flex position-relative mw-100 pt-3" role="search">
      <div className="position-relative">
        <input 
          onChange={(e) => handleSearch(e)} 
          type="text" 
          className="form-control" 
          placeholder="Search Player" 
          aria-label="Search"/>
      </div>
      {
        searchQuery.length > 0 && (
          <div className="pt-5 text-dark">
            {
              searchQuery.map((user, index) => (
                <div key={index} className="border border-2 text-dark">
                  <span>{user.nick_name}</span>
                  <CustomTooltip text="add friend" position="bottom">
                    <button className="btn" onClick={() => handleFriendRequest(session?.user.id, user.id)}>
                      <PersonAdd color="green" width={15} />
                    </button>
                  </CustomTooltip>
                </div>
              ))
            }
          </div>)
      }
  </form>
  )
}