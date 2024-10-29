import { BACKEND_URL } from "@/config";
import Cookies from "js-cookie";

export const GetLobbyData = async () => {
	try {
		const response = await fetch(`${BACKEND_URL}/api/lobby/`, {
			method: "GET",
			credentials: 'include'
		});
		if (!response.ok) {
			throw new Error(`[${response.status}] ` + 'Network response was not ok');
		}
		const data = await response.json()
		return data
	} catch (error) {
		console.error('Error fetching tournament data:', error)
		throw error
	}
}



export const AddLobbyData = async (payload: {
	name: string,
	difficultyLevel: number,
	pointsPerGame: number,
	power_ups: boolean,
	player1: number
} | undefined) => {
	try {
		const response = await fetch(`${BACKEND_URL}/api/lobby/`, {
			method: "POST",
			credentials: 'include',
			headers: {
				"Content-Type": "application/json",
				'X-CSRFToken': Cookies.get('csrftoken') as string
			},
			body: JSON.stringify(payload),
		})
		if (!response.ok) {
			throw new Error('Network response was not ok')
		}
		const { lobbyId } = await response.json()
		return lobbyId
	} catch (error) {
		console.error('Error adding lobby data:', error)
		throw error
	}
}

export const JoinLobby = async (lobbyId: string, userId: number) => {
	try {
		const response = await fetch(BACKEND_URL + '/api/lobby/join/', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': Cookies.get('csrftoken') as string
			},
			body: JSON.stringify({ lobbyId: lobbyId, userId: userId }),
		})
		const data = await response.json()
		if (!response.ok)
			throw new Error(data.message)
	}
	catch (error) {
		throw error
	}
}
