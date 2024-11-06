const backendPort = process.env.BACKEND_PORT;

import { lobbyUsers, gameLobbies, gameRooms } from "./server.js";

export default function gameLobbyEvents(io, socket) {
	socket.on('joinRoom', async (data) => {
		const { lobbyId, user, gameMode } = data;
		if (gameMode === 2)
			lobbyUsers.set(socket.id, { userId: user.id, mode: 0 });
		else if (gameMode === 3)
			lobbyUsers.set(socket.id, { userId: user.id, mode: 1 });

		let lobby = gameLobbies.get(lobbyId);
		if (!lobby) {
			gameLobbies.set(lobbyId, {
				player1: user,
				player2: null
			});
			lobby = gameLobbies.get(lobbyId);
			socket.emit('isHost');
		}
		else {
			if (!lobby.player1) {
				if (lobby.player2 && lobby.player2.id != user.id)
					lobby.player1 = user;
			}
			else if (!lobby.player2) {
				if (lobby.player1.id != user.id)
					lobby.player2 = user;
			}
		}
		socket.join(lobbyId);
		io.in(lobbyId).emit('updatedPlayers', lobby);

		const createGame = async (lobby) => {
			const response = await fetch(`http://django:${backendPort}/api/game/create`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					'player1': lobby.player1.id,
					'player2': lobby.player2.id,
					'game_mode': gameMode,
					'tournamentLink': gameMode === 3 ? data.tournamentLink : null
				})
			});
			if (response.status === 201) {
				const data = await response.json()
				return data
			}
		}
		if (lobby.player1 && lobby.player2) {
			const gameInfos = await createGame(lobby);
			io.in(lobbyId).emit('initGame', gameInfos);
		}
	});

}