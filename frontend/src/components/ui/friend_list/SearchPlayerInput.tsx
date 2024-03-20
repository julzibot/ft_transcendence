"use client";

import React, { useState } from "react"

export default function SearchPlayerInput() {
  const [searchQuery, setSearchQuery] = useState([]);

  const handleSearch = async (event: any) => {
    const response = await fetch("http://localhost:8000/api/search-user/", {
      method: "post",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(event.target.value)
    })
    if(!response.ok) {
      setSearchQuery([])
      return false
    }
    const res = await response.json()
    setSearchQuery(res.users)
  }

  return(
    <form className="d-flex position-relative" role="search">
      <div className="position-relative">
        <input 
          onChange={(e) => handleSearch(e)} 
          type="search" 
          className="form-control" 
          placeholder="Search Player" 
          aria-label="Search"/>
      </div>
      {
        searchQuery.length > 0 && (
          <div className="position-absolute pt-5 text-dark">
            {
              searchQuery.map(nickName => (
                <span>{nickName}</span>
              ))
            }
          </div>)
      }
  </form>
  )
}