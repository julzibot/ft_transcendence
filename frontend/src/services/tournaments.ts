import { BACKEND_URL } from "@/config";
import Cookies from "js-cookie";

export const GetTournamentData = async () => {
	try {
		const response = await fetch(`${BACKEND_URL}/api/tournament/`, {
			method: "GET",
			credentials: 'include'
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

interface LobbyForm {
	name: string,
	player1: number,
	difficultyLevel: number,
	pointsPerGame: number,
	power_ups: boolean,
}

export const CreateTournament = async (payload: LobbyForm) => {
	try {
		const response = await fetch(BACKEND_URL + `/api/tournament/create/`, {
			method: "POST",
			credentials: 'include',
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": Cookies.get('csrftoken') as string
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


export const fetchTournamentInfo = async (tournamentId: number) => {
	const response = await fetch(BACKEND_URL + `/tournament/${tournamentId}`, {
		method: "GET",
	})
	const data = await response.json()
	return data
}

export const joinTournament = async (tournamentId: number, userId: number | undefined) => {
	try {

		const response = await fetch(BACKEND_URL + '/api/tournament/join/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ tournament_id: tournamentId, user_id: userId }),
		})
		const data = await response.json()
		if (!response.ok)
			throw new Error(data.message)
	}
	catch (error) {
		throw error
	}
}

export const leaveTournament = async (tournamentId: number, userId: number) => {
	const response = await fetch(BACKEND_URL + `/tournamentParticipants/leaveTournament/${tournamentId}/user/${userId}`, {
		method: 'DELETE',
	})
	const data = await response.json()
	return data
}

export const startTournament = async (tournamentId: string) => {
	await fetch(`${BACKEND_URL}/api/tournament/${tournamentId}/start/`, {
		method: 'PUT',
		credentials: 'include',
		headers: {
			"Content-Type": 'application/json',
			"X-CSRFToken": Cookies.get('csrftoken') as string
		}
	}
	)
}
