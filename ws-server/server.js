import { createServer } from 'node:https';
import { Server } from "socket.io";
import { readFileSync } from "fs";

import gameEvents from './gameEvents.js';
import tournamentEvents from './tournamentEvents.js';
import lobbyEvents from './lobbyEvents.js';

const port = process.env.SOCKET_PORT;
const domain = process.env.DOMAIN_NAME;
const frontendPort = process.env.FRONTEND_PORT;
const backendPort = process.env.BACKEND_PORT;

export const lobbyUsers = new Map(); // socket.id -> {user.id, 0 || 1}
export const gameUsers = new Map(); // socket.id -> {user.id, 0 || 1} // socket.id -> {user.id}
export const tournamentUsers = new Map(); // socket.id -> user.id

export const gameLobbies = new Map(); // lobbyId -> {player1 (userId), player2 (userId)}
export const gameRooms = new Map(); // roomId -> {player1 (socket.id), player2 (socket.id)}
export const tournamentsArray = [];

// setInterval(() => {

// 	console.log(`[Interval] Checking lobbies...`);
// 	lobbyUsers.forEach((user, socketId) => {
// 		if (!lobby.socket.has(socketId)) {

// 			for (const [lobbyId, lobby] of gameLobbies.entries()) {
// 				if (lobby.player1 === user.userId || lobby.player2 === user.userId) {
// 					if (lobby.player1 === user.userId)
// 						lobby.player1 = null;
// 					else if (lobby.player2 === user.userId)
// 						lobby.player2 = null;
// 					if (lobby.player1 === null && lobby.player2 === null) {
// 						gameLobbies.delete(lobbyId);
// 					}
// 					break;
// 				}
// 			}
// 			lobbyUsers.delete(socketId);
// 		}
// 	});

// 	gameUsers.forEach((player, socketId) => {
// 		if (!game.socket.has(socketId)) {

// 			for (const [gameId, gameRoom] of gameRooms.entries()) {
// 				if (gameRoom.player1 === socketId || gameRoom.player2 === socketId) {
// 					if (gameRoom.player1 === socketId)
// 						gameRoom.player1 = null;
// 					else if (gameRoom.player2 === socketId)
// 						gameRoom.player2 = null;
// 					if (gameRoom.player1 === null && gameRoom.player2 === null) {
// 						gameRooms.delete(gameId);
// 					}
// 					break;
// 				}
// 			}
// 			gameUsers.delete(socketId);
// 		}
// 	});
// }, 300000); // 5 mins

// const tournament = {
// 	tournamentId: 0,
//	startTime: performance.now(),
//	duration: 0,
// 	participants: [participant1, ...],
//	inLobby: [participant1, ...],
// 	rooms: []
// }

//	const participant = {
// 	user: {
// 		id,
// 		username,
// 		image
// 	},
//	return_time,
//	opponents: new Map(),
// 	wins,
// 	gamesPlayed
// }

const deleteParticipant = async (tournamentId, userId) => {
	// Inform other participants about the disconnected participant
	await fetch(`http://django:${backendPort}/api/tournament/${tournamentId}/delete-participant/`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ userId })
	})
};

const server = createServer({
	key: readFileSync('/etc/ssl/certs/key.pem'),
	cert: readFileSync('/etc/ssl/certs/cert.pem')
});

const io = new Server(server, {
	cors: {
		origin: `https://${domain}:${frontendPort}`,
		methods: ["GET", "POST"],
		credentials: true
	}
});

const lobby = io.of('/lobby');
const game = io.of('/game');
const tournament = io.of('/tournament');

// LOBBY
lobby.on('connection', async (socket) => {
	console.log('[lobby] New connection: ' + socket.id);

	lobbyEvents(lobby, socket);

	socket.on('disconnect', async () => {
		const disconnectedUser = lobbyUsers.get(socket.id);
		if (!disconnectedUser) {
			console.log(`[lobby] [disconnect] Player not found`);
			return;
		}
		else
			console.log('[lobby]' + socket.id + ' -> ' + disconnectedUser.userId + " has disconnected");

		const userId = disconnectedUser.userId;
		lobbyUsers.delete(socket.id);

		gameLobbies.forEach(async (lobby, lobbyId) => {
			if (lobby.player1 || lobby.player2) {
				if (lobby.player1 && lobby.player1.id === userId)
					lobby.player1 = null;
				else if (lobby.player2 && lobby.player2.id === userId)
					lobby.player2 = null;
				console.log(`[lobby] [disconnect] Player disconnected. Lobby: ${JSON.stringify(lobby)}`);
				if (lobby.player1 || lobby.player2) {
					await fetch(`http://django:${backendPort}/api/lobby/${lobbyId}/`, {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						credentials: 'include',
						body: JSON.stringify({ userId })
					});
					io.in(lobbyId).emit('updatedPlayers', lobby);
				}
				else {
					console.log(`[lobby] [disconnect] Both players are null. Deleting lobby: ${lobbyId}`);
					await fetch(`http://django:${backendPort}/api/lobby/${lobbyId}/`, {
						method: 'DELETE',
						headers: { 'Content-Type': 'application/json' },
						credentials: 'include',
					});
					gameLobbies.delete(lobbyId);
				}
			}
		})
	});
});

// GAME
game.on('connection', (socket) => {
	console.log('[game] New connection: ' + socket.id);

	gameEvents(game, lobby, socket);

	// socket.on('leaveGameRoom', (data) => {
	// });

	socket.on('disconnecting', () => {
		console.log(`[game] [${socket.id}] Disconnecting...`);

		// for (const [roomId, room] of gameRooms.entries()) {
		// 	if (room.player1 === socket.id || room.player2 === socket.id) {
		// 		if (room.player1 === socket.id)
		// 			console.log(`[game] [disconnecting] Player1 disconnected. Informing room: ${JSON.stringify(room)}`);
		// 		else
		// 			console.log(`[game] [disconnecting] Player2 disconnected. Informing room: ${JSON.stringify(room)}`);
		// 		socket.to(roomId).emit('playerDisconnected');
		// 		break;
		// 	}
		// }
	})

	socket.on('disconnect', () => {
		console.log('[game] [disconnect] GAME USERS => ' + JSON.stringify(Array.from(gameUsers.entries())));
		const disconnectedUser = gameUsers.get(socket.id);
		if (!disconnectedUser) {
			console.log(`[game] [disconnect] Player not found`);
			return;
		}
		else
			console.log('[game]' + socket.id + ' -> ' + disconnectedUser.userId + " has disconnected");

		for (const [roomId, room] of gameRooms.entries()) {
			if (room.player1 === socket.id || room.player2 === socket.id) {
				if (room.player1 === socket.id) {
					room.player1 = null;
					console.log(`[game] [disconnection] Player1 disconnected. Informing room: ${JSON.stringify(room)}`);
				}
				else if (room.player2 === socket.id) {
					room.player2 = null;
					console.log(`[game] [disconnection] Player2 disconnected. Informing room: ${JSON.stringify(room)}`);
				}
				socket.to(roomId).emit('playerDisconnected');
				gameUsers.delete(socket.id);
				if (room.player1 === null && room.player2 === null) {
					console.log(`[game] Room deleted`);
					gameRooms.delete(roomId);
				}
				break;
			}
		}
	})
});

// TOURNAMENT
tournament.on('connection', (socket) => {
	console.log('[tournament] New connection: ' + socket.id);
	tournamentEvents(tournament, socket);


	socket.on('disconnect', async () => {
		console.log(`[tournament] [disconnect] Player disconnecting`);
		const disconnectedUserId = tournamentUsers.get(socket.id);
		console.log('[tournament] [disconnect] disc user ' + JSON.stringify(disconnectedUserId));
		if (!disconnectedUserId) {
			console.log(`[tournament] [disconnect] Player ID not found`);
			return;
		}
		else {
			console.log('[tournament] [disconnect] ' + socket.id + ' -> ' + disconnectedUserId + " has disconnected");
			tournamentsArray.forEach(t => {
				const part = t.participants.find(p => p.user.id === disconnectedUserId);
				if (part) {
					console.log(`[tournament] [disconnect] emitting opponentLeft event to ${t.tournamentId}`);
					tournament.in(t.tournamentId).emit('opponentLeft', {userId: disconnectedUserId});
					t.disconnected.push(disconnectedUserId);
					if (t.inLobby) {
						const playerIndex = t.inLobby.findIndex(p => p.user.id === disconnectedUserId);
						console.log(`[tournament] [disconnect] ${playerIndex}`);
						if (playerIndex != -1) {
							t.inLobby.splice(playerIndex, 1);
							console.log(`[tournament] [disconnect] spliced`)
						}
					}
				}
			})
		}
	});
})

server.listen(port, () => {
	console.log(`Socket server is listening on https://${domain}:` + port);
});