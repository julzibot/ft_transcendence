import { BASE_URL } from "@/utils/constants";

export const GetTournamentData = async (gameName:String) => {
    try {
        const response = await fetch(BASE_URL + `tournament/${gameName}`, {
            method: "GET",
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error fetching tournament data:', error)
        throw error
    }
}

export const GetLobbyData = async () => {
  try{
    const response = await fetch (BASE_URL + `lobby/`,{
      method: "GET"
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json()
    return data
  } catch(error){
    console.error('Error fetching tournament data:', error)
    throw error
  }
}

export const AddTournamentData = async (payload: any) => {
    try {
        const response = await fetch(BASE_URL + `tournament/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })
        if (!response.ok) {
            throw new Error('Network response was not ok')
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error adding tournament data:', error)
        throw error
    }
}

export const AddLobbyData = async (payload: any) => {
    try {
      const response = await fetch(BASE_URL + `lobby/`, {
        method: "POST",
        headers: {
          "Content-Type" : "application/json"
        },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error adding lobby data:', error)
      throw error
    }
}

export const fetchTournamentInfo = async (tournamentId: number) => {
  const response = await fetch(BASE_URL + `tournament/${tournamentId}`,{
    method: "GET",
  })
  const data = await response.json()
  return data
}

export const joinTournament = async (tournamentId:number, userId:number) => {
  const response = await fetch( BASE_URL + 'tournamentParticipants/joinTournament', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tournament_id: tournamentId, user_id: userId }),
  })
  const data = await response.json()
  return data
}

export const leaveTournament = async (tournamentId: number, userId: number) => {
  const response = await fetch( BASE_URL + `tournamentParticipants/leaveTournament/${tournamentId}/user/${userId}`, {
    method: 'DELETE',
  })
  const data = await response.json()
  return data
}
export const createMatchMakingTournament = async (tournamentId: number, userId: number) => {
  const response = await fetch( BASE_URL + `tournamentPairings/createMatchMaking/${tournamentId}/roundId/${userId}`, {
    method: "GET",
  })
  const data = await response.json()
  return data
}
export const createMatchMaking = async (tournamentId: number, roundId: number) => {
  const response = await fetch( BASE_URL + `tournamentPairings/createMatchMaking/${tournamentId}/roundId/${roundId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tournament_id: tournamentId, round_id: roundId }),
  })
  const data = await response.json()
  return data
}