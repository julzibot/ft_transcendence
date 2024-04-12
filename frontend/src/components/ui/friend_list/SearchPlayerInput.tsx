"use client";

import React, { useState } from "react"
import { PersonAdd  } from "react-bootstrap-icons";
import { CustomTooltip } from "@/components/Utils/Tooltip";

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
    <form className="d-flex position-relative mw-100 pt-3" role="search">
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
                <div className="border border-2">
                  <span>{nickName}</span>
                  <CustomTooltip text="Add friend" position="bottom">
                    <button className="btn">
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